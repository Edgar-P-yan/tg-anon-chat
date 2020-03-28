import { injectable, inject } from 'inversify';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import createSocksProxyAgent from 'socks-proxy-agent';
import winston from 'winston';
import { Types } from '../types';
import { botClsNs } from '../lib/bot-cls-ns';
import { ConfigService } from '../config';
import { CommandHandlerService } from '../command-handler';
import session from 'telegraf/session';

@injectable()
export class BotService {
  public bot: Telegraf<ContextMessageUpdate>;

  constructor(
    @inject(Types.Config)
    private readonly config: ConfigService,
    @inject(Types.Logger)
    private readonly logger: winston.Logger,
    @inject(Types.CommandHandler)
    private readonly commandHandler: CommandHandlerService,
  ) {
    this.bot = this.initBot();
    this.setCommandHandlers();
  }

  private setCommandHandlers(): void {
    this.bot.start(
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.startHandler(ctx),
    );

    this.bot.command('me', ctx => this.commandHandler.me(ctx));

    this.bot.command(
      'search',
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.search(ctx),
    );
  }

  private initBot(): Telegraf<ContextMessageUpdate> {
    const bot = this.createTelegramBot();

    bot.catch((error: any) => {
      this.logger.error({ error });
    });

    bot.use((ctx, next) => {
      return botClsNs.runAndReturn(() => {
        botClsNs.set('bot_context', ctx);
        return next();
      });
    });

    bot.use(session());

    return bot;
  }

  private createTelegramBot(): Telegraf<ContextMessageUpdate> {
    const bot = new Telegraf(this.config.get('BOT_TOKEN'), {
      telegram: {
        agent:
          (this.config.get('SOCKS_PROXY') &&
            (createSocksProxyAgent(this.config.get('SOCKS_PROXY')) as any)) ||
          null,
      },
    });

    return bot;
  }
}

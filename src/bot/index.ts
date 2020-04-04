import { injectable, inject } from 'inversify';
import Telegraf, { ContextMessageUpdate, Middleware } from 'telegraf';
import createSocksProxyAgent from 'socks-proxy-agent';
import winston from 'winston';
import { Types } from '../types';
import { botClsNs } from '../lib/bot-cls-ns';
import { ConfigService } from '../config';
import { CommandHandlerService } from '../command-handler';
import session from 'telegraf/session';
import { TelegramBotError } from '../errors';
import { Strings } from '../strings';
import RedisSession from 'telegraf-session-redis';

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

    this.bot.command(
      'me',
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.me(ctx),
    );

    this.bot.command(
      'search',
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.search(ctx),
    );

    this.bot.command(
      'stop',
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.stopChat(ctx),
    );

    this.bot.command(
      'report',
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.report(ctx),
    );

    this.bot.on(
      [
        'text',
        'photo',
        'sticker',
        'video',
        'document',
        'animation',
        'voice',
        'video_note',
        'audio',
      ],
      (...args) => this.commandHandler.ensureUserMiddleware(...args),
      ctx => this.commandHandler.messageHandler(ctx),
    );
  }

  private initBot(): Telegraf<ContextMessageUpdate> {
    const bot = this.createTelegramBot();

    bot.catch(async (error: any, ctx: ContextMessageUpdate) => {
      if (error instanceof TelegramBotError) {
        await ctx.reply(error.message);
        return;
      }
      await ctx.reply(Strings.unknown_error_msg);
      this.logger.error('Error occurred', { error, ctx });
    });

    bot.use((ctx, next) => {
      return botClsNs.runAndReturn(() => {
        botClsNs.set('bot_context', ctx);
        return next();
      });
    });

    let sessionMiddleware: Middleware<ContextMessageUpdate> = null;

    if (this.config.get('SESSION_STORAGE') === 'redis') {
      sessionMiddleware = new RedisSession({
        store: {
          url: this.config.get('REDIS_URL'),
          prefix: 'tg-anon-chat-0:',
        } as any,
      }).middleware();
    } else {
      sessionMiddleware = session();
    }

    bot.use(sessionMiddleware);

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

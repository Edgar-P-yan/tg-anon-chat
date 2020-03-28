import { injectable } from 'inversify';
import { ContextMessageUpdate } from 'telegraf';
import { Strings } from '../strings';

@injectable()
export class CommandHandlerService {
  public async startHandler(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(Strings.hello_msg);
  }
}

import { injectable, inject } from 'inversify';
import { ContextMessageUpdate } from 'telegraf';
import { Strings } from '../strings';
import { UsersService } from '../users';
import { Types } from '../types';

@injectable()
export class CommandHandlerService {
  constructor (
    @inject(Types.UsersService)
    private readonly usersService: UsersService
  ) {}

  public async startHandler(ctx: ContextMessageUpdate): Promise<void> {
    await this.usersService.ensureUser(ctx.from)
    await ctx.reply(Strings.hello_msg);
  }

  public async me(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(JSON.stringify(ctx.from, null, 2))
  }
}

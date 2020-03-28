import { injectable, inject } from 'inversify';
import { ContextMessageUpdate } from 'telegraf';
import { Strings } from '../strings';
import { UsersService } from '../users';
import { Types } from '../types';
import _ from 'lodash';

@injectable()
export class CommandHandlerService {
  constructor(
    @inject(Types.UsersService)
    private readonly usersService: UsersService,
  ) {}

  public async startHandler(ctx: ContextMessageUpdate): Promise<void> {
    if (_.isNil(ctx.session.userId)) {
      const user = await this.usersService.ensureUser(ctx.from);
      ctx.session.userId = user.id;
    }
    await ctx.reply(Strings.hello_msg);
  }

  public async me(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(JSON.stringify(ctx.from, null, 2));
  }
}

import { injectable, inject } from 'inversify';
import { ContextMessageUpdate } from 'telegraf';
import { Strings } from '../strings';
import { UsersService } from '../users';
import { Types } from '../types';
import _ from 'lodash';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { UserStatus } from '../constants/UserStatus.enum';

@injectable()
export class CommandHandlerService {
  constructor(
    @inject(Types.UsersService)
    private readonly usersService: UsersService,
  ) {}

  public async startHandler(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(Strings.hello_msg);
  }

  public async me(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(JSON.stringify(ctx.from, null, 2));
  }

  @Transactional()
  public async search(ctx: ContextMessageUpdate): Promise<void> {
    const user = await this.usersService.usersRep.findOne(ctx.session.userId);

    if (user.status === UserStatus.BUSY) {
      ctx.reply(Strings.stop_first_msg);
      return;
    }

    user.status = UserStatus.SEARCHING;
    await this.usersService.usersRep.save(user);
    ctx.reply(Strings.search_started_msg);
  }

  async ensureUserMiddleware(
    ctx: ContextMessageUpdate,
    next: () => any,
  ): Promise<void> {
    if (_.isNil(ctx.session.userId)) {
      const user = await this.usersService.ensureUser(ctx.from);
      ctx.session.userId = user.id;
    }
    await next();
  }
}

import { injectable, inject } from 'inversify';
import { ContextMessageUpdate } from 'telegraf';
import { Strings } from '../strings';
import { UsersService } from '../users';
import { Types } from '../types';
import _ from 'lodash';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { UserStatus } from '../constants/UserStatus.enum';
import { ChatsService } from '../chats-service';
import { ChatStatus } from '../constants/ChatStatus.enum';
import { decorators } from '../lib/container';

@injectable()
export class CommandHandlerService {
  @decorators.lazyInject(Types.ChatsService)
  private readonly chatsService: ChatsService;

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
    await ctx.reply(Strings.search_started_msg);
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

  async messageHandler(ctx: ContextMessageUpdate): Promise<void> {
    const user = await this.usersService.usersRep.findOne(ctx.session.userId);
    if (user.status !== UserStatus.BUSY) {
      await ctx.reply(Strings.you_are_not_in_chat_msg);
      return;
    }

    const chat = await this.chatsService.chatsRep.findOne({
      where: [
        { first_user_id: user.id, status: ChatStatus.ACTIVE },
        { second_user_id: user.id, status: ChatStatus.ACTIVE },
      ],
      relations: ['firstUser', 'secondUser'],
    });

    if (!chat) {
      await ctx.reply('Error occurred');
      throw new Error(`Chat not found for user ${user.id}`);
    }

    const companion =
      chat.firstUser.id === user.id ? chat.secondUser : chat.firstUser;

    const telegraf = await this.chatsService.getTelegrafInstance();

    await telegraf.telegram.sendMessage(companion.tg_id, ctx.message.text);
  }
}

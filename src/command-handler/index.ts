import { injectable, inject } from 'inversify';
import { ContextMessageUpdate } from 'telegraf';
import { Strings } from '../strings';
import { UsersService } from '../users';
import { Types } from '../types';
import _ from 'lodash';
import { Transactional, Propagation } from 'typeorm-transactional-cls-hooked';
import { UserStatus } from '../constants/UserStatus.enum';
import { ChatsService } from '../chats-service';
import { ChatStatus } from '../constants/ChatStatus.enum';
import { decorators } from '../lib/container';
import { MessagesService } from '../messages';
import { ChatData } from './interfaces/ChatData.interface';

@injectable()
export class CommandHandlerService {
  @decorators.lazyInject(Types.ChatsService)
  private readonly chatsService: ChatsService;

  constructor(
    @inject(Types.UsersService)
    private readonly usersService: UsersService,
    @inject(Types.MessagesService)
    private readonly messagesService: MessagesService,
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

  @Transactional()
  async messageHandler(ctx: ContextMessageUpdate): Promise<void> {
    const { user, companion, chat } = await this.getCurrentChatData(ctx);

    if (user.status !== UserStatus.BUSY) {
      await ctx.reply(Strings.you_are_not_in_chat_msg);
      return null;
    }

    if (!chat || !companion) {
      await ctx.reply('Error occurred');
      throw new Error(`Chat not found for user ${user.id}`);
    }

    await this.messagesService.saveMessage(user, chat, ctx.message);
    await this.handleMessageProxy({ user, chat, companion }, ctx);
  }

  @Transactional()
  async stopChat(ctx: ContextMessageUpdate): Promise<void> {
    const { user, chat, companion } = await this.getCurrentChatData(ctx);

    if (user.status === UserStatus.SEARCHING) {
      user.status = UserStatus.OFFLINE;
      await this.usersService.usersRep.save(user);
      await ctx.reply(Strings.stop_search_msg);
      return;
    }

    if (user.status !== UserStatus.BUSY) {
      await ctx.reply(Strings.you_are_not_in_chat_msg);
      return;
    }

    if (!chat || !companion) {
      await ctx.reply('Error occurred');
      throw new Error(`Chat not found for user ${user.id}`);
    }

    chat.status = ChatStatus.INACTIVE;
    await this.chatsService.chatsRep.save(chat);

    user.status = UserStatus.OFFLINE;
    await this.usersService.usersRep.save(user);

    companion.status = UserStatus.OFFLINE;
    await this.usersService.usersRep.save(companion);

    const telegraf = this.chatsService.getTelegrafInstance();

    await telegraf.telegram.sendMessage(user.tg_id, Strings.chat_stopped_msg);
    await telegraf.telegram.sendMessage(
      companion.tg_id,
      Strings.chat_stopped_msg,
    );
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  private async getCurrentChatData(
    ctx: ContextMessageUpdate,
  ): Promise<ChatData> {
    const user = await this.usersService.usersRep.findOne(ctx.session.userId);

    const chat = await this.chatsService.chatsRep.findOne({
      where: [
        { first_user_id: user.id, status: ChatStatus.ACTIVE },
        { second_user_id: user.id, status: ChatStatus.ACTIVE },
      ],
      relations: ['firstUser', 'secondUser'],
    });

    const companion = chat
      ? chat.firstUser.id === user.id
        ? chat.secondUser
        : chat.firstUser
      : null;

    return {
      user,
      companion: companion || null,
      chat: chat || null,
    };
  }

  private async handleMessageProxy(
    { companion }: ChatData,
    ctx: ContextMessageUpdate,
  ): Promise<void> {
    const telegraf = this.chatsService.getTelegrafInstance();

    ctx.updateSubTypes[0];

    if (ctx.updateSubTypes[0] === 'photo') {
      await telegraf.telegram.sendPhoto(
        companion.tg_id,
        _.last(ctx.message.photo).file_id,
        {
          caption: ctx.message.caption,
        },
      );
    } else if (ctx.updateSubTypes[0] === 'text') {
      await telegraf.telegram.sendMessage(companion.tg_id, ctx.message.text);
    } else if (ctx.updateSubTypes[0] === 'sticker') {
      await telegraf.telegram.sendSticker(
        companion.tg_id,
        ctx.message.sticker.file_id,
      );
    } else {
      await telegraf.telegram.sendMessage(
        companion.tg_id,
        ctx.message.caption || Strings.unknown_message_format_msg,
      );
    }
  }
}

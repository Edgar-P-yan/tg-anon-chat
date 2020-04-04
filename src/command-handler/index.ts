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
import { TelegramBotError } from '../errors';
import { ReportsService } from '../reports';

@injectable()
export class CommandHandlerService {
  @decorators.lazyInject(Types.ChatsService)
  private readonly chatsService: ChatsService;

  @inject(Types.UsersService)
  private readonly usersService: UsersService;

  @inject(Types.MessagesService)
  private readonly messagesService: MessagesService;

  @inject(Types.ReportsService)
  private readonly reportsService: ReportsService;

  public async startHandler(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(Strings.hello_msg);
  }

  public async me(ctx: ContextMessageUpdate): Promise<void> {
    await ctx.reply(JSON.stringify(ctx.from, null, 2));
  }

  public async report(ctx: ContextMessageUpdate): Promise<void> {
    const { user, chat, companion } = await this.getCurrentChatData(ctx);
    if (!chat || !companion) {
      throw new TelegramBotError(Strings.you_are_not_in_chat_msg);
    }

    await this.reportsService.createReport(user, chat);
    await ctx.reply(Strings.report_created_msg);
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
      throw new TelegramBotError(Strings.you_are_not_in_chat_msg);
    }

    if (!chat || !companion) {
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

  @Transactional({ propagation: Propagation.SUPPORTS })
  private async handleMessageProxy(
    { companion }: ChatData,
    ctx: ContextMessageUpdate,
  ): Promise<void> {
    const telegraf = this.chatsService.getTelegrafInstance();

    const forwardInfoPrefix = this._formatForwardInfoPrefix(ctx);
    const caption = ctx.message.caption
      ? forwardInfoPrefix + ctx.message.caption
      : forwardInfoPrefix;

    if (_.includes(ctx.updateSubTypes, 'photo')) {
      await telegraf.telegram.sendPhoto(
        companion.tg_id,
        _.last(ctx.message.photo).file_id,
        { caption },
      );
    } else if (_.includes(ctx.updateSubTypes, 'text')) {
      await telegraf.telegram.sendMessage(
        companion.tg_id,
        forwardInfoPrefix + (ctx.message.text || ''),
      );
    } else if (_.includes(ctx.updateSubTypes, 'sticker')) {
      await telegraf.telegram.sendSticker(
        companion.tg_id,
        ctx.message.sticker.file_id,
      );
    } else if (_.includes(ctx.updateSubTypes, 'video')) {
      await telegraf.telegram.sendVideo(
        companion.tg_id,
        ctx.message.video.file_id,
        {
          caption,
          thumb: ctx.message.video.thumb?.file_id,
        },
      );
    } else if (_.includes(ctx.updateSubTypes, 'animation')) {
      /**
       * check for 'animation' with 'include' and before checking
       * for 'document', because for backward compatibility, when
       * this field is set, the document field will also be set
       * @see https://core.telegram.org/bots/api#message
       */

      await telegraf.telegram.sendAnimation(
        companion.tg_id,
        ctx.message.animation.file_id,
        { caption },
      );
    } else if (_.includes(ctx.updateSubTypes, 'document')) {
      await telegraf.telegram.sendDocument(
        companion.tg_id,
        ctx.message.document.file_id,
        {
          caption,
          thumb: ctx.message.document.thumb?.file_id,
        },
      );
    } else if (_.includes(ctx.updateSubTypes, 'voice')) {
      await telegraf.telegram.sendVoice(
        companion.tg_id,
        ctx.message.voice.file_id,
        { caption },
      );
    } else if (_.includes(ctx.updateSubTypes, 'audio')) {
      await telegraf.telegram.sendAudio(
        companion.tg_id,
        ctx.message.audio.file_id,
        {
          caption,
        },
      );
    } else if (_.includes(ctx.updateSubTypes, 'video_note')) {
      await telegraf.telegram.sendVideoNote(
        companion.tg_id,
        ctx.message.video_note.file_id,
        {
          thumb: ctx.message.video_note.thumb?.file_id,
        },
      );
    } else {
      throw new TelegramBotError(Strings.unknown_message_format_msg);
    }
  }

  private _formatForwardInfoPrefix(ctx: ContextMessageUpdate): string {
    let forwardInfoPrefix = '';

    const getFullName = (subject: {
      first_name?: string;
      last_name?: string;
    }): string =>
      (subject.first_name || '') +
      (subject.first_name && subject.last_name ? ' ' : '') +
      (subject.last_name || '');

    if (_.includes(ctx.updateSubTypes, 'forward')) {
      const forwardedFromName =
        ctx.message['forward_sender_name'] ||
        (ctx.message.forward_from
          ? getFullName(ctx.message.forward_from)
          : ctx.message.forward_from_chat
          ? ctx.message.forward_from_chat.title ||
            getFullName(ctx.message.forward_from_chat)
          : '');

      forwardInfoPrefix += `${Strings.forwarded_from_msg} ${forwardedFromName} \n`;
    }

    return forwardInfoPrefix;
  }
}

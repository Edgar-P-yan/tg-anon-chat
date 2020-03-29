import { getCustomRepository } from 'typeorm';
import { MessagesRepository } from './Message.repository';
import { injectable } from 'inversify';
import { User } from '../users/User.entity';
import { IncomingMessage } from 'telegraf/typings/telegram-types';
import { Message } from './Message.entity';
import { Chat } from '../chats-service/Chat.entity';
import { Transactional, Propagation } from 'typeorm-transactional-cls-hooked';

@injectable()
export class MessagesService {
  public readonly messagesRep: MessagesRepository;
  constructor() {
    this.messagesRep = getCustomRepository(MessagesRepository);
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async saveMessage(
    user: User,
    chat: Chat,
    message: IncomingMessage,
  ): Promise<Message> {
    const msg = this.messagesRep.create({
      chat_id: chat.id,
      user_id: user.id,
      message,
    });
    await this.messagesRep.save(msg);
    return msg;
  }
}

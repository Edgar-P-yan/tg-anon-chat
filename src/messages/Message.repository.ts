import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Message } from './Message.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Message)
export class MessagesRepository extends BaseRepository<Message> {}

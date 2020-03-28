import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Chat } from './Chat.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Chat)
export class ChatsRepository extends BaseRepository<Chat> {}

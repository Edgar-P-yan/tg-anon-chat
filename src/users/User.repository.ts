import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { User } from './User.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(User)
export class UsersRepository extends BaseRepository<User> {}

import { injectable } from 'inversify';
import { User } from './User.entity';
import { UsersRepository } from './User.repository';
import { getCustomRepository } from 'typeorm';
import { User as TelegramUser } from 'telegraf/typings/telegram-types';
import { Transactional, Propagation } from 'typeorm-transactional-cls-hooked';

@injectable()
export class UsersService {
  public readonly usersRepository: UsersRepository;
  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async ensureUser(tgUser: TelegramUser): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      tg_id: tgUser.id,
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = this.usersRepository.create({
      tg_id: tgUser.id,
      tg_is_bot: tgUser.is_bot,
      tg_first_name: tgUser.first_name,
      tg_last_name: tgUser.last_name,
      tg_username: tgUser.username,
      tg_language_code: tgUser.language_code,
    });
    await this.usersRepository.save(newUser);

    return newUser;
  }
}

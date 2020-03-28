import { injectable, inject } from 'inversify';
import { ChatsRepository } from './Chat.repository';
import { getCustomRepository, In } from 'typeorm';
import { UsersService } from '../users';
import { Types } from '../types';
import { Chat } from './Chat.entity';
import { UserStatus } from '../constants/UserStatus.enum';
import _ from 'lodash';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ChatStatus } from '../constants/ChatStatus.enum';
import { BotService } from '../bot';
import { Strings } from '../strings';

@injectable()
export class ChatsService {
  public readonly chatsRep: ChatsRepository;
  constructor(
    @inject(Types.UsersService)
    private readonly usersService: UsersService,
    @inject(Types.Bot)
    private readonly botService: BotService,
  ) {
    this.chatsRep = getCustomRepository(ChatsRepository);
  }

  @Transactional()
  public async findPairsAndCreateChats(): Promise<Chat[]> {
    const searchingUsersIds = await this.usersService.usersRep
      .createQueryBuilder('users')
      .select('users.id', 'id')
      .addSelect('users.tg_id', 'tg_id')
      .where('users.status = :status', { status: UserStatus.SEARCHING })
      .getRawMany<{ id: number; tg_id: number }>();

    if (searchingUsersIds.length < 2) {
      return [];
    }

    // Remove last element if we cant form pairs from them
    if (searchingUsersIds.length % 2 != 0) {
      searchingUsersIds.pop();
    }

    const shuffledIds = _.shuffle(searchingUsersIds);

    const createdChats: Chat[] = [];

    for (let i = 0; i < shuffledIds.length; i += 2) {
      const firstUser = shuffledIds[i];
      const secondUser = shuffledIds[i + 1];

      await this.usersService.usersRep.update(
        {
          id: In([firstUser.id, secondUser.id]),
        },
        {
          status: UserStatus.BUSY,
        },
      );

      const chat = this.chatsRep.create({
        first_user_id: firstUser.id,
        second_user_id: secondUser.id,
        status: ChatStatus.ACTIVE,
      });
      await this.chatsRep.save(chat);

      await this.botService.bot.telegram.sendMessage(
        firstUser.tg_id,
        Strings.found_person_msg,
      );
      await this.botService.bot.telegram.sendMessage(
        secondUser.tg_id,
        Strings.found_person_msg,
      );

      createdChats.push(chat);
    }

    return createdChats;
  }
}

import { injectable } from 'inversify';
import { getCustomRepository } from 'typeorm';
import { Report } from './Report.entity';
import { Transactional, Propagation } from 'typeorm-transactional-cls-hooked';
import { ReportsRepository } from './Report.repository';
import { Chat } from '../chats-service/Chat.entity';
import { User } from '../users/User.entity';

@injectable()
export class ReportsService {
  public reportsRep = getCustomRepository(ReportsRepository);

  @Transactional({ propagation: Propagation.SUPPORTS })
  async createReport(reporter: User, chat: Chat): Promise<Report> {
    const report = this.reportsRep.create({
      chat_id: chat.id,
      reporter_id: reporter.id,
    });
    await this.reportsRep.save(report);

    return report;
  }
}

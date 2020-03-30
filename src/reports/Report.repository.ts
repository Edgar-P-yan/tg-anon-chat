import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Report } from './Report.entity';

@EntityRepository(Report)
export class ReportsRepository extends BaseRepository<Report> {}

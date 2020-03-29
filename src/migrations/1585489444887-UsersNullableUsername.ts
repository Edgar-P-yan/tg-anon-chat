import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersNullableUsername1585489444887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN tg_username DROP NOT NULL;
    `);
  }

  public async down(): Promise<any> {
    // do nothing
  }
}

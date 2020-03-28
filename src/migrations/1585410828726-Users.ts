import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Users1585410828726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        indices: [
          {
            name: 'UQ_users__tg_id',
            columnNames: ['tg_id'],
            isUnique: true,
          },
          {
            name: 'IX_users__tg_username',
            columnNames: ['tg_username'],
          }
        ],
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'tg_first_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tg_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'tg_is_bot',
            type: 'varchar',
            isNullable: false,
            default: false
          },
          {
            name: 'tg_language_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tg_last_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tg_username',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('users')
  }
}

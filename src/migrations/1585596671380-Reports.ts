import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Reports1585596671380 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'reports',
        indices: [
          {
            name: 'IX_reports__chat_id',
            columnNames: ['chat_id'],
          },
          {
            name: 'IX_reports__reporter_id',
            columnNames: ['reporter_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_reports__chat_id',
            columnNames: ['chat_id'],
            referencedTableName: 'chats',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_reports__reporter_id',
            columnNames: ['reporter_id'],
            referencedTableName: 'reports',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
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
            name: 'chat_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'reporter_id',
            type: 'integer',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('reports');
  }
}

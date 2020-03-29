import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Messages1585509670282 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        indices: [
          {
            name: 'IX_messages__chat_id',
            columnNames: ['chat_id'],
          },
          {
            name: 'IX_messages__user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'IX_messages__created_at',
            columnNames: ['created_at'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_messages__chat_id',
            columnNames: ['chat_id'],
            referencedTableName: 'chats',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_messages__user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
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
            name: 'chat_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'jsonb',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('messages');
  }
}

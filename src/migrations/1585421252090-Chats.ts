import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Chats1585421252090 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'chats',
        indices: [
          {
            name: 'IX_chats__first_user_id',
            columnNames: ['first_user_id'],
          },
          {
            name: 'IX_chats__second_user_id',
            columnNames: ['second_user_id'],
          },
          {
            name: 'IX_chats__status',
            columnNames: ['status'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_chats__first_user_id',
            columnNames: ['first_user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_chats__second_user_id',
            columnNames: ['second_user_id'],
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
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'first_user_id',
            type: 'number',
            isNullable: false,
          },
          {
            name: 'second_user_id',
            type: 'number',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            default: 'INACTIVE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('chats');
  }
}

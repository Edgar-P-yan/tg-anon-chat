import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class UsersStatus1585416461651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IX_users__status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropColumn('users', 'status');
    await queryRunner.dropIndex('users', 'IX_users__status');
  }
}

import { createConnection } from 'typeorm';

export async function runMigrations(): Promise<void> {
  const connection = await createConnection();
  await connection.runMigrations({ transaction: 'all' });
  await connection.close();
}

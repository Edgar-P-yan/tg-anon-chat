require('dotenv').config();
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  throw new Error('Env vars DB_*** are required');
}

module.exports = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrationsTableName: 'migrations',
  migrations: ['dist/src/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

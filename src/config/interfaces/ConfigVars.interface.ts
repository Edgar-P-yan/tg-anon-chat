export interface ConfigVars {
  NODE_ENV: string;
  BOT_TOKEN: string;

  SOCKS_PROXY?: string;

  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  SESSION_STORAGE: 'memory' | 'redis';
  REDIS_URL?: string;
}

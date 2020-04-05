export interface ConfigVars {
  NODE_ENV: string;
  BOT_TOKEN: string;

  /**
   * Use web hooks or not.
   * true/false
   * Optional. Default: false
   */
  WEB_HOOKS: boolean;

  /**
   * Use only if you are using WebHooks.
   * The port on which webhook server will listen
   * Note: telegram sends webhooks only to these ports: 443, 80, 88, 8443
   * @see https://core.telegram.org/bots/api#setwebhook
   */
  PORT: number;

  /**
   *
   * Use only if you are using WebHooks.
   * This is the url that server will use for WebHooks.
   * You should config it in your bots settings
   * and then set it here. Should be secret,
   * for example, can contain your BOT_TOKEN.
   * @example
   * 'https://server.tld:8443/secret-path'
   */
  WEB_HOOKS_SECRET_URL: string;

  /**
   * Use only if you are using WebHooks.
   * The path from your WEB_HOOKS_SECRET_URL
   * @example
   * '/secret-path'
   */
  WEB_HOOKS_PATH: string;

  SOCKS_PROXY?: string;

  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  SESSION_STORAGE: 'memory' | 'redis';
  REDIS_URL?: string;

  MIGRATIONS_AUTO_RUN: boolean;
}

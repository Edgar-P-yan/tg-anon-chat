import { injectable } from 'inversify';
import { ConfigVars } from './interfaces/ConfigVars.interface';
import Joi from '@hapi/joi';

@injectable()
export class ConfigService {
  public configVars: ConfigVars;

  public constructor(envVars: NodeJS.ProcessEnv) {
    this.configVars = this.validate(envVars);
  }

  public get<Key extends keyof ConfigVars>(key: Key): ConfigVars[Key] {
    return this.configVars[key];
  }

  private validate(envVars: NodeJS.ProcessEnv): ConfigVars {
    const { value, error } = Joi.object({
      BOT_TOKEN: Joi.string().required(),
      SOCKS_PROXY: Joi.string()
        .uri()
        .optional(),

      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.string().required(),
      DB_USERNAME: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      DB_NAME: Joi.string().required(),

      SESSION_STORAGE: Joi.string()
        .allow('memory', 'redis')
        .optional()
        .default('memory'),

      REDIS_URL: Joi.when('SESSION_STORAGE', {
        is: 'redis',
        then: Joi.string()
          .uri()
          .required(),
        otherwise: Joi.any().strip(),
      }),
    })
      .options({
        stripUnknown: true,
      })
      .validate(envVars);

    if (error) {
      throw error;
    }

    return value as ConfigVars;
  }
}

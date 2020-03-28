import { injectable } from 'inversify';
import { ConfigVars } from './interfaces/ConfigVars.interface'

@injectable()
export class ConfigService {
  public configVars: ConfigVars

  public constructor(envVars: NodeJS.ProcessEnv) {
    this.configVars = envVars as any
  }

  public get<Key extends keyof ConfigVars>(key: Key): ConfigVars[Key] {
    return this.configVars[key]
  }
}
import { Container } from 'inversify'
import { Types } from './types'
import { ConfigService } from './config'
import { CommandHandlerService } from './command-handler'
import { loggerDynamicValueFactory } from './logger'
import { BotService } from './bot'
import dotenv from 'dotenv'

dotenv.config()

export const container = new Container()

container.bind(Types.Config).toConstantValue(new ConfigService(process.env))
container.bind(Types.Logger).toDynamicValue(loggerDynamicValueFactory)
container.bind(Types.CommandHandler).to(CommandHandlerService)
container.bind(Types.Bot).to(BotService)

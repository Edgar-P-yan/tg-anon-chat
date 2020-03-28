import 'reflect-metadata'
import { container } from './inversify.config'
import { Types } from './types'
import winston from 'winston'
import { BotService } from './bot'
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked'
import * as typeorm from 'typeorm'

async function bootstrap (): Promise<void> {
  initializeTransactionalContext()
  await typeorm.createConnection()

  const logger = container.get<winston.Logger>(Types.Logger)
  const botService = container.get<BotService>(Types.Bot)

  await botService.bot.launch()

  logger.info('Bot launched')
}

bootstrap().catch(console.error)

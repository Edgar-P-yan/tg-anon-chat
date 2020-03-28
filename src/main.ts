import 'reflect-metadata'
import { container } from './inversify.config'
import { Types } from './types'
import winston from 'winston'
import { BotService } from './bot'

async function bootstrap (): Promise<void> {
  const logger = container.get<winston.Logger>(Types.Logger)
  const botService = container.get<BotService>(Types.Bot)

  await botService.bot.launch()

  logger.info('Bot launched')
}

bootstrap().catch(console.error)

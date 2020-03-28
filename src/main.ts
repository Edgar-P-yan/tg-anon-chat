import 'reflect-metadata';
import { container } from './inversify.config';
import { Types } from './types';
import winston from 'winston';
import { BotService } from './bot';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import * as typeorm from 'typeorm';
import { ChatsService } from './chats-service';
import delay from 'delay';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext();
  await typeorm.createConnection();

  const logger = container.get<winston.Logger>(Types.Logger);
  const botService = container.get<BotService>(Types.Bot);
  const chatsService = container.get<ChatsService>(Types.ChatsService);

  (async (): Promise<never> => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await chatsService.findPairsAndCreateChats();
      await delay(1000);
    }
  })().catch(console.error);

  await botService.bot.launch();

  logger.info('Bot launched');
}

bootstrap().catch(console.error);

import 'reflect-metadata';
import { container } from './inversify.config';
import { Types } from './types';
import winston from 'winston';
import { BotService } from './bot';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import * as typeorm from 'typeorm';
import { ChatsService } from './chats-service';
import delay from 'delay';
import { ConfigService } from './config';
import { runMigrations } from './lib/run-migrations';

async function bootstrap(): Promise<void> {
  const configService = container.get<ConfigService>(Types.Config);
  const logger = container.get<winston.Logger>(Types.Logger);

  if (configService.get('MIGRATIONS_AUTO_RUN')) {
    logger.info('Running migrations');
    await runMigrations();
    logger.info('Migrations run complete');
  } else {
    logger.info('Migrations auto-run is disabled');
  }

  initializeTransactionalContext();

  await typeorm.createConnection();

  const botService = container.get<BotService>(Types.Bot);
  const chatsService = container.get<ChatsService>(Types.ChatsService);

  (async (): Promise<never> => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await chatsService.findPairsAndCreateChats();
      await delay(1000);
    }
  })().catch(console.error);

  if (configService.get('WEB_HOOKS')) {
    await botService.bot.telegram.setWebhook(
      configService.get('WEB_HOOKS_SECRET_URL'),
    );

    botService.bot.startWebhook(
      configService.get('WEB_HOOKS_PATH'),
      null,
      configService.get('PORT'),
    );

    logger.info('Bot launched. mode: webhook');
  } else {
    await botService.bot.launch();

    logger.info('Bot launched. mode: long-polling');
  }
}

bootstrap().catch(console.error);

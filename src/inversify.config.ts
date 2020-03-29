import { Types } from './types';
import { ConfigService } from './config';
import { CommandHandlerService } from './command-handler';
import { loggerDynamicValueFactory } from './logger';
import { BotService } from './bot';
import dotenv from 'dotenv';
import { UsersService } from './users';
import { ChatsService } from './chats-service';
import { container } from './lib/container';

dotenv.config();

container.bind(Types.Config).toConstantValue(new ConfigService(process.env));
container.bind(Types.Logger).toDynamicValue(loggerDynamicValueFactory);
container.bind(Types.CommandHandler).to(CommandHandlerService);
container.bind(Types.UsersService).to(UsersService);
container.bind(Types.ChatsService).to(ChatsService);
container.bind(Types.Bot).to(BotService);

export { container };

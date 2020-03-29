import { User } from '../../users/User.entity';
import { Chat } from '../../chats-service/Chat.entity';

export interface ChatData {
  user: User;
  companion?: User;
  chat?: Chat;
}

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
} from 'typeorm';
import { Chat } from '../chats-service/Chat.entity';
import { User } from '../users/User.entity';
import { IncomingMessage } from 'telegraf/typings/telegram-types';

@Entity({
  name: 'messages',
})
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  chat_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'jsonb' })
  message: IncomingMessage;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

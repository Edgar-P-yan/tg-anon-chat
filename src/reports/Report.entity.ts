import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
} from 'typeorm';
import { Chat } from '../chats-service/Chat.entity';
import { User } from '../users/User.entity';

@Entity({
  name: 'reports',
})
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  chat_id: number;

  @Column()
  reporter_id: number;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/User.entity';
import { ChatStatus } from '../constants/ChatStatus.enum';

@Entity({
  name: 'chats',
})
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  first_user_id: number;

  @Column()
  second_user_id: number;

  @Column({ default: ChatStatus.INACTIVE })
  status: ChatStatus;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'first_user_id' })
  firstUser: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'second_user_id' })
  secondUser: User;
}

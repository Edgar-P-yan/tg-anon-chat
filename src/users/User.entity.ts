import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar' })
  tg_first_name: string;

  @Column({ type: 'integer' })
  tg_id: number;

  @Column({ type: 'boolean' })
  tg_is_bot: boolean;

  @Column({ type: 'varchar' })
  tg_language_code: string;

  @Column({ type: 'varchar' })
  tg_last_name: string;

  @Column({ type: 'varchar' })
  tg_username: string;
}

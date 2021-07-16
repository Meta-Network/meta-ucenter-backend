import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn()
  user: User;

  @Column()
  account_id: string;

  @Column()
  platform: 'email' | string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

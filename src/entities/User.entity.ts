import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './Account.entity';
import { TwoFactorAuth } from './TwoFactorAuth.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  username: string;

  @Column({ default: '' })
  nickname: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png' })
  avatar: string;

  @OneToMany(() => TwoFactorAuth, (twa) => twa.user)
  twoFactors: TwoFactorAuth[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

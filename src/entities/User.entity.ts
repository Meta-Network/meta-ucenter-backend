import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterLoad,
  JoinTable,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TwoFactorAuth, (twa) => twa.user, { eager: true })
  @JoinTable()
  twoFactors: TwoFactorAuth[];

  // it should be computed by the fn below:
  // by defeault it is false.
  is2FAEnabled = false;

  // update in object when load inserted or update
  // no DB writing for this.
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  keepingTrackOf2FAStatus(): void {
    if (this.twoFactors) this.is2FAEnabled = this.twoFactors.length > 0;
  }
}

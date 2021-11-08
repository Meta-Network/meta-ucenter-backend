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
  Index,
} from 'typeorm';
import { TwoFactorAuth } from './TwoFactorAuth.entity';
import { IsOptional, IsUrl, Length, Matches } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  @Matches(/[a-z0-9-]+/)
  @Length(3, 15)
  username: string;

  @Column({ default: '' })
  @Length(1, 32)
  nickname: string;

  @Column({ default: '' })
  @Length(1, 200)
  bio: string;

  @Column({ default: 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png' })
  @IsUrl()
  avatar: string;

  @CreateDateColumn()
  created_at: Date;

  @Index()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TwoFactorAuth, (twa) => twa.user, { eager: true })
  @JoinTable()
  twoFactors: TwoFactorAuth[];

  // it should be computed by the fn below:
  // by default it is false.
  is2FAEnabled = false;

  // update in object when load inserted or update
  // no DB writing for this.
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  @IsOptional()
  keepingTrackOf2FAStatus(): void {
    if (this.twoFactors) this.is2FAEnabled = this.twoFactors.length > 0;
  }
}

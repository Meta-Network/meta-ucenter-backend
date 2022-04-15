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
import { IsOptional, IsUrl, Length, Matches } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  @Matches(/^[a-z0-9-]+$/)
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
}

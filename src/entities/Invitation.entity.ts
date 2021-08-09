import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sub: string;

  @Column()
  signature: string;

  @Column()
  salt: string;

  @Column()
  issuer: string;

  @Column()
  message: string;

  @ApiProperty({ description: '邀请被创建的原因，用以区分创建邀请的多种方式' })
  @Column({
    default: '',
    comment: '邀请被创建的原因，用以区分创建邀请的多种方式',
  })
  cause: string;

  @Column({ default: 0 })
  invitee_user_id: number;

  @Column({ default: 0 })
  inviter_user_id: number;

  @Column({ default: 0 })
  matataki_user_id: number;

  @Column()
  expired_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

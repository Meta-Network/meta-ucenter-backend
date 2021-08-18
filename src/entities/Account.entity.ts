import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '账号对应的用户 id',
  })
  @Column({
    nullable: false,
    comment: '账号对应的用户 id',
  })
  user_id: number;

  @ApiProperty({
    description: '账号名称，例如邮箱',
  })
  @Column({
    nullable: false,
    comment: '账号名称，例如邮箱',
  })
  account_id: string;

  @ApiProperty({
    description: '账户的登录方式',
  })
  @Column({
    nullable: false,
    comment: '账户的登录方式',
  })
  platform: 'email' | string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

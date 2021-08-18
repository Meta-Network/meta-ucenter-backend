import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class WebAuthN {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '对应的用户名作为id' })
  @Column({
    name: 'username',
    nullable: false,
    comment: '对应的用户名作为id',
  })
  @Column()
  username: string;

  @ApiProperty({ description: '认证id，用于 WebAuthN 的登录校验' })
  @Column({
    name: 'credential_id',
    nullable: false,
    comment: '认证id，用于 WebAuthN 的登录校验',
  })
  @Column()
  credential_id: string;

  @ApiProperty({
    description: '与认证 id 对应的认证公钥，多次验证应生成相同公钥',
  })
  @Column({
    name: 'public_key_bytes',
    nullable: false,
    comment: '与认证 id 对应的认证公钥，多次验证应生成相同公钥',
  })
  @Column()
  public_key: string;
}

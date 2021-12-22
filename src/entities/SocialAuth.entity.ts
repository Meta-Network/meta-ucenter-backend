import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SocialAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  type: 'oauth2';

  @Column()
  platform: 'github' | 'gitee' | 'matataki';

  @Column()
  username: string;

  @Column()
  access_token: string;

  @Column({ default: '' })
  refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import { TwoFactorType } from '../type/TwoFactor';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User.entity';

@Entity()
export class TwoFactorAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.twoFactors)
  user: User;

  /**
   * `secret` is something like:
   * a TOTP secret
   * Email address
   * Phone Number that the code sent to
   * Something that is linked to
   */
  @Column({
    nullable: true,
  })
  secret: string | null;

  @Column({
    enum: TwoFactorType,
    type: 'enum',
    nullable: false,
  })
  type: TwoFactorType;

  @Column({ default: false })
  isEnabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

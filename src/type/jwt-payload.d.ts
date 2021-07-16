import { Account } from '../entities/Account.entity';

export type JWTTokenPayload = {
  sub: number; // user id
  purpose: 'access_token' | 'refresh_token';
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  account: Account;
  created_at: Date;
  updated_at: Date;
  aud: string | string[];
  jti: string;
};

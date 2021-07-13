export type AccessTokenData = {
  sub: number; // user id
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  created_at: Date;
  updated_at: Date;
  aud: string | string[];
  jti: string;
};

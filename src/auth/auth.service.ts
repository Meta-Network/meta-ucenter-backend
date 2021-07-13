import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { AccessTokenData } from 'src/type/jwt';
import { User } from '../entities/User.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signJWT(user: User, aud: string) {
    const payload: AccessTokenData = {
      sub: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      nickname: user.nickname,
      created_at: user.created_at,
      updated_at: user.updated_at,
      aud,
      jti: crypto.randomBytes(20).toString('hex'),
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        algorithm: 'RS256',
      }),
    };
  }
}

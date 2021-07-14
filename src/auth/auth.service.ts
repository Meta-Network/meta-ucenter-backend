import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTTokenPayload } from 'src/type/jwt-payload';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/User.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signJWT(user: User, aud: string | string[]) {
    const basePayload = {
      sub: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      nickname: user.nickname,
      created_at: user.created_at,
      updated_at: user.updated_at,
      aud,
    };

    const accessToken: JWTTokenPayload = {
      purpose: 'access_token',
      jti: crypto.randomBytes(20).toString('hex'),
      ...basePayload,
    };

    const refreshToken: JWTTokenPayload = {
      purpose: 'refresh_token',
      jti: crypto.randomBytes(20).toString('hex'),
      ...basePayload,
    };

    return {
      accessToken: this.jwtService.sign(accessToken, {
        algorithm: 'RS256',
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES'),
      }),
      refreshToken: this.jwtService.sign(refreshToken, {
        algorithm: 'RS256',
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES'),
      }),
    };
  }
}

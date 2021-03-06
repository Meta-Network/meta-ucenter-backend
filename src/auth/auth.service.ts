import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JWTTokenPayload } from 'src/type/jwt-payload';
import { ConfigService } from 'src/config/config.service';
import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signAny(payload: any, options: JwtSignOptions) {
    return this.jwtService.sign(payload, options);
  }

  async signLoginJWT(user: User, account: Account) {
    const basePayload = {
      sub: user.id,
      bio: user.bio,
      avatar: user.avatar,
      username: user.username,
      nickname: user.nickname,
      created_at: user.created_at,
      updated_at: user.updated_at,
      account,
      aud: this.configService.get<string>('jwt.aud'),
      iss: this.configService.get<string>('jwt.issuer'),
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
        expiresIn: this.configService.get<string>('jwt.access_token_expires'),
      }),
      refreshToken: this.jwtService.sign(refreshToken, {
        algorithm: 'RS256',
        expiresIn: this.configService.get<string>('jwt.refresh_token_expires'),
      }),
    };
  }
}

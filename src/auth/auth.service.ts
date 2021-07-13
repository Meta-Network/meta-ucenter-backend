import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { AccessTokenData } from 'src/type/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signJWT(user: any, aud: string) {
    const payload = {
      username: user.username,
      sub: user.userId,
      aud,
      jti: crypto.randomBytes(20).toString('hex'),
    } as AccessTokenData;
    return {
      accessToken: this.jwtService.sign(payload, {
        algorithm: 'RS256',
      }),
    };
  }
}

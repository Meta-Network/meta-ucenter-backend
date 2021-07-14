import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JWTTokens } from 'src/type/jwt-login-result';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

@Injectable()
export class JWTCookieHelper {
  constructor(private configService: ConfigService) {}
  async JWTCookieWriter(res: Response, tokens: JWTTokens) {
    res.cookie('accessToken', tokens.accessToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES')),
      ),
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      domain: this.configService.get<string>('ACCESS_COOKIE_DOMAIN'),
      path: this.configService.get<string>('ACCESS_COOKIE_PATH'),
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES')),
      ),
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      domain: this.configService.get<string>('REFRESH_COOKIE_DOMAIN'),
      path: this.configService.get<string>('REFRESH_COOKIE_PATH'),
    });
  }
}

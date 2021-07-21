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
    res.cookie('ucenter_accessToken', tokens.accessToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES')),
      ),
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      domain: this.configService.get<string>('COOKIE_ACCESS_DOMAIN'),
      path: this.configService.get<string>('COOKIE_ACCESS_PATH'),
    });
    res.cookie('ucenter_refreshToken', tokens.refreshToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES')),
      ),
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      domain: this.configService.get<string>('COOKIE_REFRESH_DOMAIN'),
      path: this.configService.get<string>('COOKIE_REFRESH_PATH'),
    });
  }
}

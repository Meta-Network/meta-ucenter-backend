import { JwtService } from '@nestjs/jwt';
import { Controller, Patch, Req, Res } from '@nestjs/common';
import { JWTTokenPayload } from '../type/jwt-payload';
import { JWTCookieHelper } from './jwt-cookie-helper';
import { LoginService } from './login.service';
import { Request, Response } from 'express';

@Controller('login')
export class LoginController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loginService: LoginService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}
  @Patch('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies.refreshToken;
    const payload: JWTTokenPayload = await this.jwtService.verify(token);
    const tokens = await this.loginService.refresh(payload.sub, payload.aud);
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { success: true };
  }
}

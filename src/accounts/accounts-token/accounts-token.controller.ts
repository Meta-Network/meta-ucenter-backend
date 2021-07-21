import { JwtService } from '@nestjs/jwt';
import {
  Req,
  Res,
  Patch,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTTokenPayload } from 'src/type/jwt-payload';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { AccountsTokenService } from './accounts-token.service';
import { Request, Response } from 'express';

@ApiTags('Accounts')
@Controller('accounts/token')
export class AccountsTokenController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loginService: AccountsTokenService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @ApiCreatedResponse({
    description:
      '当 Cookies 中具有有效的{refreshToken}时，重新对{refreshToken}和{accessToken}进行签名',
  })
  @ApiUnauthorizedResponse({
    description: '当 Cookies 中的{refreshToken}过期或无效时',
  })
  @Patch('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['ucenter_refreshToken'];
    if (!token) {
      throw new UnauthorizedException();
    }
    const payload: JWTTokenPayload = await this.jwtService.verify(token);
    const tokens = await this.loginService.refresh(
      payload.sub,
      payload.account.id,
      payload.aud,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { success: true };
  }
}

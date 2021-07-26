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
import { JwtService } from '@nestjs/jwt';
import { JWTTokenPayload } from 'src/type/jwt-payload';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { AccountsTokenService } from './accounts-token.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Accounts')
@Controller('accounts/token')
export class AccountsTokenController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const refreshTokenName = this.configService.get<string>(
      'jwt.refresh_token_name',
    );
    const token = req.cookies[refreshTokenName];
    if (!token) {
      throw new UnauthorizedException(
        'Failed to refresh token; You must login.',
      );
    }
    const payload: JWTTokenPayload = await this.jwtService.verify(token);
    const { user, tokens } = await this.loginService.refresh(
      payload.sub,
      payload.account.id,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return user;
  }

  @ApiCreatedResponse({
    description: '清除登录的 tokens',
  })
  @Patch('delete')
  async delete(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.jwtCookieHelper.JWTCookieDeleter(res);
  }
}

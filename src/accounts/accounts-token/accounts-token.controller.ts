import {
  Req,
  Res,
  Patch,
  Delete,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { JWTTokenPayload } from 'src/type/jwt-payload';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { AccountsTokenService } from './accounts-token.service';
import { User } from '../../entities/User.entity';

@ApiTags('Accounts Token')
@Controller('accounts/tokens')
export class AccountsTokenController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loginService: AccountsTokenService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Patch()
  @ApiOperation({ summary: '刷新登录 Tokens 的有效期' })
  @ApiCreatedResponse({
    description: '更新 Cookies，返回当前用户信息',
  })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 refresh_token 过期或无效',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
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

  @Delete()
  @ApiOperation({ summary: '清除登录的 Tokens' })
  @ApiOkResponse({ description: '删除相关 Cookies，不返回 data' })
  async delete(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.jwtCookieHelper.JWTCookieDeleter(res);
  }
}

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTDecodedUser } from 'src/type';
import { TwoFactorType } from 'src/type/TwoFactor';
import { CurrentUser } from 'src/users/user.decorator';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(private readonly service: TwoFactorAuthService) {}

  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @Get('requestChallenge/:type')
  async requestChallenge(
    @CurrentUser() user: JWTDecodedUser,
    @Param('type') type: TwoFactorType,
  ) {
    await this.service.requestChallenge(user.id, type);
    return { message: 'OK' };
  }
}

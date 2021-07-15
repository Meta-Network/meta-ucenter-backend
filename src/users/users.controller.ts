import { Get, Patch, Body, UseGuards, Controller, Post } from '@nestjs/common';
import { CurrentUser } from './user.decorator';
import { UsersService } from './users.service';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTDecodedUser } from '../type';
import { UpdateUserDto } from './dto/update-user.dto';
import { TwoFactorAuthService } from 'src/two-factor-auth/two-factor-auth.service';
import {
  BindTwoFactorDto,
  VerifyTwoFactorDto,
} from './dto/bind-two-factor.dto';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly tfaService: TwoFactorAuthService,
  ) {}

  @UseGuards(JWTAuthGuard)
  @Get('me')
  async getMyInfo(@CurrentUser() user: JWTDecodedUser) {
    return this.usersService.getUserInfo(user.id);
  }

  @UseGuards(JWTAuthGuard)
  @Patch('me')
  async updateMyInfo(
    @CurrentUser() user: JWTDecodedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @Get('me/twoFactor')
  async getMy2FA(@CurrentUser() user: JWTDecodedUser) {
    const res = await this.tfaService.list2FAOf(user.id);
    return res;
  }

  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @Post('/twoFactor')
  async bindTwoFactor(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: BindTwoFactorDto,
  ) {
    const res = await this.tfaService.bind2FA(body.type, { id: user.id });
    return res;
  }

  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @Post('/twoFactor/verify')
  async verifyTwoFactor(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: VerifyTwoFactorDto,
  ) {
    const isPassed = await this.tfaService.verify(
      body.type,
      user.id,
      body.code,
    );
    return { isPassed };
  }

  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @Post('/twoFactor/enable')
  async enableTwoFactor(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: VerifyTwoFactorDto,
  ) {
    const isPassed = await this.tfaService.enable2FA(
      body.type,
      user.id,
      body.code,
    );
    return { isPassed };
  }
}

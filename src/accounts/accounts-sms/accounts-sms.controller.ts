import { Response } from 'express';
import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { AccountsSmsDto } from './dto/accounts-sms.dto';
import { AccountsSmsService } from './accounts-sms.service';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Login')
@Controller('login/sms')
export class AccountsSmsController {
  constructor(
    private readonly loginSmsService: AccountsSmsService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  async generateVerificationCodeForSms(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ key }> {
    await this.loginSmsService.generateVerificationCodeForSms(verifyCode.key);
    return { key: verifyCode.key };
  }

  @Post('/')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginSmsDto: AccountsSmsDto,
  ) {
    const { user, tokens } = await this.loginSmsService.login(loginSmsDto);
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);

    return { user };
  }
}

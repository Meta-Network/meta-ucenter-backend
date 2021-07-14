import { Response } from 'express';
import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { LoginSmsDto } from './dto/login-sms.dto';
import { LoginSmsService } from './login-sms.service';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';

@Controller('login/sms')
export class LoginSmsController {
  constructor(
    private readonly loginSmsService: LoginSmsService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  async generateVerificationCodeForSms(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ key }> {
    await this.loginSmsService.generateVerificationCodeForSms(verifyCode.key);
    return { key: verifyCode.key };
  }

  @Post('/:aud')
  async login(
    @Param('aud') audPlatform: string,
    @Res({ passthrough: true }) res: Response,
    @Body() loginSmsDto: LoginSmsDto,
  ) {
    const { user, tokens } = await this.loginSmsService.login(
      loginSmsDto,
      audPlatform,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user };
  }
}

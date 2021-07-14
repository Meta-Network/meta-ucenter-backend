import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginEmailDto } from './dto/login-email.dto';
import { LoginEmailService } from './login-email.service';
import { JWTCookieHelper } from 'src/login/jwt-cookie-helper';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';

@Controller('login/email')
export class LoginEmailController {
  constructor(
    private readonly loginEmailService: LoginEmailService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  async generateVerificationCodeForEmail(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ key }> {
    await this.loginEmailService.generateVerificationCodeForEmail(
      verifyCode.key,
    );
    return { key: verifyCode.key };
  }

  @Post('/:aud')
  async login(
    @Param('aud') audPlatform: string,
    @Res({ passthrough: true }) res: Response,
    @Body() loginEmailDto: LoginEmailDto,
  ) {
    const { user, tokens } = await this.loginEmailService.login(
      loginEmailDto,
      audPlatform,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user };
  }
}

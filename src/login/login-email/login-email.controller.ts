import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LoginEmailDto } from './dto/login-email.dto';
import { LoginEmailService } from './login-email.service';
import { JWTCookieHelper } from 'src/login/jwt-cookie-helper';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';

@ApiTags('Login')
@Controller('login/email')
export class LoginEmailController {
  constructor(
    private readonly loginEmailService: LoginEmailService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  @ApiCreatedResponse({
    description: '往传入的邮箱地址发送一个验证码，用于登陆接口的校验',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  async generateVerificationCodeForEmail(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ key }> {
    await this.loginEmailService.generateVerificationCodeForEmail(
      verifyCode.key,
    );
    return { key: verifyCode.key };
  }

  @Post('/:aud')
  @ApiParam({
    name: 'aud',
    example: 'ucenter',
    description: 'tokens 的受众',
    type: 'string',
    required: true,
  })
  @ApiCreatedResponse({
    description:
      '通过邮箱验证和 Captcha 验证后，返回登陆的用户信息并在 Cookies 中写入用户 tokens',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
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

import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LoginEmailDto } from './dto/login-email.dto';
import { LoginEmailService } from './login-email.service';
import { JWTCookieHelper } from 'src/login/jwt-cookie-helper';
import { User } from 'src/entities/User.entity';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { CurrentUser } from 'src/users/user.decorator';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';

@ApiTags('Accounts')
@Controller('accounts/email')
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

  @Post('login/:aud')
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
    const { user, account, tokens } = await this.loginEmailService.login(
      loginEmailDto,
      audPlatform,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('/bind')
  @UseGuards(JWTAuthGuard)
  @ApiCreatedResponse({
    description: '绑定新账号到本用户',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  @ApiUnauthorizedResponse({
    description: '当 Cookies 中的{accessToken}过期或无效时',
  })
  async bind(@CurrentUser() user: User, @Body() loginEmailDto: LoginEmailDto) {
    return this.loginEmailService.bindEmailAccount(loginEmailDto, user.id);
  }

  @Post('/unbind')
  @UseGuards(JWTAuthGuard)
  @ApiCreatedResponse({
    description: '解绑本用户的现有邮箱账户',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  @ApiUnauthorizedResponse({
    description: '当 Cookies 中的{accessToken}过期或无效时',
  })
  // TODO: TEST bind and unbind method
  async unbind(@Body() loginEmailDto: LoginEmailDto) {
    return this.loginEmailService.unbindEmailAccount(loginEmailDto);
  }
}

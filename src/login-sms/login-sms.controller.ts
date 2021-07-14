import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoginSmsService } from './login-sms.service';
import { LoginSmsDto } from './dto/login-sms.dto';

@Controller('login/sms')
export class LoginSmsController {
  constructor(private readonly loginSmsService: LoginSmsService) {}

  @Post('/:aud')
  async login(
    @Param('aud') audPlatform: string,
    @Body() loginSmsDto: LoginSmsDto,
  ) {
    return this.loginSmsService.login(loginSmsDto, audPlatform);
  }
}

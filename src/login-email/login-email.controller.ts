import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoginEmailDto } from './dto/login-email.dto';
import { LoginEmailService } from './login-email.service';

@Controller('login/email')
export class LoginEmailController {
  constructor(private readonly loginEmailService: LoginEmailService) {}
  @Post('/:aud')
  async login(
    @Param('aud') audPlatform: string,
    @Body() loginEmailDto: LoginEmailDto,
  ) {
    return this.loginEmailService.login(loginEmailDto, audPlatform);
  }
}

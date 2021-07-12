import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { LoginService } from './login.service';
import { emailCaptchaVerifyQuery } from './login.dto';

@Controller('login')
export class LoginController {
  // how many services can be loaded here????
  // controller->service ..... service->service....?
  constructor(private readonly loginService: LoginService) {}

  @Get()
  getLoginPage(): string {
    return this.loginService.getLoginPage();
  }

  @Get('pre-email')
  preEmail(@Query('email') email: string) {
    // use regex to verify email format...
    return this.loginService.generateCaptcha(email);
  }

  @Get('verify-email')
  verifyEmail(@Query() query: emailCaptchaVerifyQuery) {
    return `query: ${JSON.stringify(query)}`;
  }
  // @ property cannot use this....?
  // @Get('pre-github')
  // @Redirect(this.github_redirect_url, 301)
  // getPreGithub(): void {
  //   return null;
  // }

  @Get('complete-github')
  async findGithub(@Query('code') code: string) {
    const verifyResult = await this.loginService.verifyLoginCodeAsync(code);
    console.log(verifyResult);
    return verifyResult;
  }
}

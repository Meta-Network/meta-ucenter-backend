import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaService } from '../captcha/captcha.service';
import { User } from '../entities/User.entity';
import { LoginSmsDto } from './dto/login-sms.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class LoginSmsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  async login(loginSmsDto: LoginSmsDto, aud = 'ucenter') {
    // TODO: must verify the verifyCode first
    const isCaptchaVerified = await this.captchaService.verify(
      loginSmsDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }
    const user: User = await this.usersService.findOrSave(
      loginSmsDto.phoneNumber,
    );

    return this.authService.signJWT(user, aud);
  }
}

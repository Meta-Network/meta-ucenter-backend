import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaService } from '../captcha/captcha.service';
import { User } from '../entities/User.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { LoginEmailDto } from './dto/login-email.dto';

@Injectable()
export class LoginEmailService {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  async login(loginEmailDto: LoginEmailDto, aud = 'ucenter') {
    // TODO: must verify the verifyCode
    const isCaptchaVerified = await this.captchaService.verify(
      loginEmailDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }
    const user: User = await this.usersService.findOrSave(loginEmailDto.email);
    return this.authService.signJWT(user, aud);
  }
}

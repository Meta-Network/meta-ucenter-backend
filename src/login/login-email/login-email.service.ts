import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaService } from 'src/captcha/captcha.service';
import { User } from 'src/entities/User.entity';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { JWTTokens } from '../../type/jwt-login-result';
import { LoginEmailDto } from './dto/login-email.dto';

@Injectable()
export class LoginEmailService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(email: string): Promise<string> {
    const code = await this.verificationCodeService.generate(email);
    await sendVerificationCodeEmail(email, code);

    return code;
  }

  async login(loginEmailDto: LoginEmailDto, aud = 'ucenter') {
    const isEmailVerified = await this.verificationCodeService.verify(
      loginEmailDto.email,
      loginEmailDto.verifyCode,
    );
    if (!isEmailVerified) {
      throw new BadRequestException('Email authentication is not verified.');
    }

    const isCaptchaVerified = await this.captchaService.verify(
      loginEmailDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }
    const user: User = await this.usersService.findOrSave(loginEmailDto.email);
    const tokens: JWTTokens = await this.authService.signJWT(user, aud);
    return {
      user,
      tokens,
    };
  }
}

async function sendVerificationCodeEmail(
  email: string,
  code: string,
): Promise<void> {
  // throw new Error('Function not implemented.');
}

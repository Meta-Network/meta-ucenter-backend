import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entities/User.entity';
import { AuthService } from 'src/auth/auth.service';
import { JWTTokens } from 'src/type/jwt-login-result';
import { UsersService } from 'src/users/users.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { EmailService } from '../../email/email.service';
import { LoginEmailDto } from './dto/login-email.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(email: string): Promise<string> {
    const code = await this.verificationCodeService.generate(email);
    //  用邮件服务发送生成的验证码
    await this.sendVerificationCodeEmail(email, code);
    return code;
  }

  private async sendVerificationCodeEmail(email: string, code: string) {
    const [from, fromName, templateInvokeName] = [
      'EMAIL_FROM',
      'EMAIL_FROM_NAME',
      'EMAIL_TEMPLATE_INVOKE_NAME_VCODE',
    ].map((key) => this.configService.get<string>(key));

    this.emailService.send(
      {
        from,
        fromName,
        to: email,
        templateInvokeName,
      },
      { code },
    );
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

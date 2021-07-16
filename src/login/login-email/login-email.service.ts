import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/User.entity';
import { AuthService } from 'src/auth/auth.service';
import { JWTTokens } from 'src/type/jwt-login-result';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AccountsService } from '../../accounts/accounts.service';
import { Account } from '../../entities/Account.entity';
import { LoginEmailDto } from './dto/login-email.dto';

@Injectable()
export class LoginEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(email: string): Promise<string> {
    const code = await this.verificationCodeService.generateAndStore(email);
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
    await this.veryifyEmail(loginEmailDto);

    const userAccountData = {
      account_id: loginEmailDto.email,
      platform: 'email',
    };

    let userAccount: Account = await this.accountsService.findBy(
      userAccountData,
      { relations: ['user'] },
    );
    let user;

    if (!userAccount) {
      user = await this.usersService.save();
      userAccount = await this.accountsService.save({
        ...userAccountData,
        user,
      });
    } else {
      user = userAccount.user;
    }

    const tokens: JWTTokens = await this.authService.signJWT(
      user,
      userAccount,
      aud,
    );
    return {
      user,
      tokens,
      userAccount,
    };
  }

  private async veryifyEmail(loginEmailDto: LoginEmailDto): Promise<void> {
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
  }
}

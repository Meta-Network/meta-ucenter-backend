import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from 'src/config/config.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { AccountsEmailDto } from './dto/accounts-email.dto';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AccountsService } from '../accounts.service';

@Injectable()
export class AccountsEmailService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(email: string): Promise<string> {
    const code = await this.verificationCodeService.generateVcode(
      'email-login',
      email,
    );
    //  用邮件服务发送生成的验证码
    await this.sendVerificationCodeEmail(email, code);
    return code;
  }

  private async sendVerificationCodeEmail(email: string, code: string) {
    await this.emailService.send(email, { code });
  }

  async verify(accountsEmailDto: AccountsEmailDto): Promise<void> {
    const isEmailVerified = await this.verificationCodeService.verify(
      'email-login',
      accountsEmailDto.account,
      accountsEmailDto.verifyCode,
    );
    if (!isEmailVerified) {
      throw new BadRequestException('Email authentication is not verified.');
    }

    const isCaptchaVerified = await this.captchaService.verify(
      accountsEmailDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { VerificationCodeService } from '../verification-code/verification-code.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class EmailStrategy {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(email: string): Promise<void> {
    const code = await this.verificationCodeService.generateVcode(
      'email-login',
      email,
    );
    //  用邮件服务发送生成的验证码
    await this.sendVerificationCodeEmail(email, code);
  }

  private async sendVerificationCodeEmail(email: string, code: string) {
    const [from, fromName, templateInvokeName] = [
      'email.from',
      'email.from_name',
      'email.template_invoke_name_vcode',
    ].map((key) => this.configService.getBiz<string>(key));

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

  async verify(email: string, verifyCode: string): Promise<boolean> {
    const isEmailVerified = await this.verificationCodeService.verify(
      'email-login',
      email,
      verifyCode,
    );
    return isEmailVerified;
  }
}

import {
  Logger,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from 'src/config/config.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { AccountsEmailDto } from './dto/accounts-email.dto';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AccountsService } from '../accounts.service';
import { VerificationCodeDto } from '../../verification-code/dto/verification-code.dto';

@Injectable()
export class AccountsEmailService {
  private logger = new Logger(AccountsEmailService.name);
  constructor(
    private readonly accountsService: AccountsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(
    verificationCodeDto: VerificationCodeDto,
  ): Promise<string> {
    const email = verificationCodeDto.key;

    const isCaptchaVerified = await this.captchaService.verify(
      verificationCodeDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }

    const code = await this.verificationCodeService.generateVcode(
      'email-login',
      email,
    );

    this.logger.debug(`用户 ${email} 申请验证码为：${code}`);
    // 用邮件服务发送生成的验证码
    await this.emailService.send(email, { code });
    return code;
  }

  async increaseLoginFailedCount(email: string): Promise<number> {
    const prefix = 'email-login-failed-count';
    const current =
      (await this.verificationCodeService.getMultiAttemptsCount(
        prefix,
        email,
      )) + 1;

    if (
      current >
      this.configService.getBiz<number>('user.try_vcode_attempts_limit')
    ) {
      await this.verificationCodeService.clear('email-login', email);
      await this.verificationCodeService.setMultiAttemptsCount(
        prefix,
        email,
        0,
      );
      throw new ForbiddenException(
        'Too many attempts. Please request a new verification code.',
      );
    }

    return await this.verificationCodeService.setMultiAttemptsCount(
      prefix,
      email,
      current,
    );
  }

  async increaseGetVcodeCount(ip: string): Promise<number> {
    const prefixCount = 'email-get-vcode-count';
    const prefixCoolDown = 'email-get-vcode-cool-down';

    if (
      !this.configService.getBiz<boolean>('user.get_vcode_times_limit_enabled')
    ) {
      return 0;
    }

    const current =
      (await this.verificationCodeService.getMultiAttemptsCount(
        prefixCount,
        ip,
      )) + 1;

    if (
      current >= this.configService.getBiz<number>('user.get_vcode_times_limit')
    ) {
      await this.verificationCodeService.setIPInCoolDown(
        prefixCoolDown,
        ip,
        this.configService.getBiz<number>(
          'user.get_vcode_times_cool_down_time',
        ),
        this.configService.getBiz<number>('user.get_vcode_times_ttl'),
      );
    }

    return await this.verificationCodeService.setMultiAttemptsCount(
      prefixCount,
      ip,
      current,
    );
  }

  async getIPInCoolDown(ip: string): Promise<number> {
    const prefixCoolDown = 'email-get-vcode-cool-down';
    return await this.verificationCodeService.getIPInCoolDown(
      prefixCoolDown,
      ip,
    );
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
  }
}

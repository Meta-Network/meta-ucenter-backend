import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaService } from 'src/captcha/captcha.service';
import { User } from 'src/entities/User.entity';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { JWTTokens } from '../../type/jwt-login-result';
import { AccountsSmsDto } from './dto/accounts-sms.dto';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AccountsSmsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForSms(phoneNumber: string): Promise<string> {
    const code = await this.verificationCodeService.generateVcode(
      'sms-login',
      phoneNumber,
    );
    await sendVerificationCodeSms(phoneNumber, code);
    return code;
  }

  async login(loginSmsDto: AccountsSmsDto) {
    const isSmsVerified = await this.verificationCodeService.verify(
      'sms-login',
      loginSmsDto.phoneNumber,
      loginSmsDto.verifyCode,
    );
    if (!isSmsVerified) {
      throw new BadRequestException('SMS authentication is not verified.');
    }

    const isCaptchaVerified = await this.captchaService.verify(
      loginSmsDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }

    // const user: User = await this.usersService.findOrSave(
    //   loginSmsDto.phoneNumber,
    // );
    let user;
    // const tokens: JWTTokens = await this.authService.signJWT(user, aud);
    let tokens;
    return {
      user,
      tokens,
    };
  }
}

function sendVerificationCodeSms(phoneNumber: string, code: string) {
  // throw new Error('Function not implemented.');
}

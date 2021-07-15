import { Injectable } from '@nestjs/common';
import { verify as hcaptchaVerify } from 'hcaptcha';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaService {
  constructor(private configService: ConfigService) {}
  async verify(token): Promise<boolean> {
    if (this.configService.get<string>('CAPTCHA_ENABLED') === 'false') {
      return true;
    }
    const secret = this.configService.get<string>('HCAPTCHA_SECRET');
    return (await hcaptchaVerify(secret, token)).success;
  }
}
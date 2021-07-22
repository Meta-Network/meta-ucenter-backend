import { Injectable } from '@nestjs/common';
import { verify as hcaptchaVerify } from 'hcaptcha';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaService {
  constructor(private configService: ConfigService) {}
  async verify(token): Promise<boolean> {
    if (!this.configService.get<boolean>('hcaptcha.is_enabled')) {
      return true;
    }
    const secret = this.configService.get<string>('hcaptcha.secret');
    return (await hcaptchaVerify(secret, token)).success;
  }
}

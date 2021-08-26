import { Injectable } from '@nestjs/common';
import { verify as hcaptchaVerify } from 'hcaptcha';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class CaptchaService {
  constructor(private configService: ConfigService) {}
  async verify(token): Promise<boolean> {
    if (!this.configService.getBiz<boolean>('hcaptcha.enabled')) {
      return true;
    }
    const secret = this.configService.getBiz<string>('hcaptcha.secret');
    return (await hcaptchaVerify(secret, token)).success;
  }
}

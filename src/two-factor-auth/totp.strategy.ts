// import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { APP_NAME_ON_AUTHENTICATOR } from 'src/constants';
import { User } from 'src/entities/User.entity';

// @Injectable()
export class TotpStrategy {
  static async generate(username: string) {
    const secret = authenticator.generateSecret();

    const otpauth = authenticator.keyuri(
      username,
      APP_NAME_ON_AUTHENTICATOR,
      secret,
    );

    return { secret, otpauth };
  }

  static validate(token: string, secret: string) {
    return authenticator.check(token, secret);
  }
}

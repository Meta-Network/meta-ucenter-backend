import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { EmailModule } from 'src/email/email.module';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AccountsMetamaskController } from './accounts-metamask.controller';

@Module({
  imports: [
    HttpModule,
    EmailModule,
    AuthModule,
    UsersModule,
    CaptchaModule,
    AccountsModule,
    VerificationCodeModule,
  ],
  providers: [AccountsMetamaskService],
  controllers: [AccountsMetamaskController],
})
export class AccountsMetamaskModule {}

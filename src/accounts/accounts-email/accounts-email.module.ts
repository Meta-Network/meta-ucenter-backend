import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { EmailModule } from 'src/email/email.module';
import { AccountsEmailService } from './accounts-email.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AccountsEmailController } from './accounts-email.controller';
import { InvitationModule } from '../../invitation/invitation.module';

@Module({
  imports: [
    HttpModule,
    EmailModule,
    AuthModule,
    UsersModule,
    CaptchaModule,
    AccountsModule,
    InvitationModule,
    VerificationCodeModule,
  ],
  providers: [AccountsEmailService],
  controllers: [AccountsEmailController],
})
export class AccountsEmailModule {}

import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { InvitationModule } from 'src/invitation/invitation.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsMetamaskController } from './accounts-metamask.controller';

@Module({
  imports: [
    HttpModule,
    EmailModule,
    AuthModule,
    UsersModule,
    CaptchaModule,
    InvitationModule,
    VerificationCodeModule,
    forwardRef(() => AccountsModule),
  ],
  providers: [AccountsMetamaskService],
  controllers: [AccountsMetamaskController],
  exports: [AccountsMetamaskService],
})
export class AccountsMetamaskModule {}

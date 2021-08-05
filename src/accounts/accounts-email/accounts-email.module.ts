import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { EmailModule } from 'src/email/email.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AccountsEmailService } from './accounts-email.service';
import { AccountsEmailController } from './accounts-email.controller';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EmailModule,
    CaptchaModule,
    VerificationCodeModule,
    forwardRef(() => AccountsModule),
  ],
  providers: [AccountsEmailService],
  controllers: [AccountsEmailController],
  exports: [AccountsEmailService],
})
export class AccountsEmailModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { EmailModule } from 'src/email/email.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AccountsEmailService } from './accounts-email.service';
import { AccountsEmailController } from './accounts-email.controller';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { AccountsManager } from '../accounts.manager';
import { AccountsService } from '../accounts.service';
import { AccountsEmailDto } from './dto/accounts-email.dto';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EmailModule,
    CaptchaModule,
    VerificationCodeModule,
    AccountsModule,
  ],
  providers: [
    AccountsEmailService,
    {
      provide: AccountsManager,
      useFactory: (accountsService: AccountsService, accountsEmailService) =>
        new AccountsManager(
          accountsService,
          'email',
          (accountsEmailDto: AccountsEmailDto) =>
            accountsEmailService.verify(accountsEmailDto),
        ),
      inject: [AccountsService, AccountsEmailService],
    },
  ],
  controllers: [AccountsEmailController],
  exports: [AccountsEmailService],
})
export class AccountsEmailModule {}

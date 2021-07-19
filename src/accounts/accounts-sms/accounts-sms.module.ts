import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { AccountsSmsService } from './accounts-sms.service';
import { AccountsSmsController } from './accounts-sms.controller';

@Module({
  imports: [AuthModule, UsersModule, CaptchaModule, VerificationCodeModule],
  providers: [AccountsSmsService],
  controllers: [AccountsSmsController],
})
export class AccountsSmsModule {}

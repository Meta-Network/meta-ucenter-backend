import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { LoginModule } from '../login.module';
import { LoginSmsService } from './login-sms.service';
import { LoginSmsController } from './login-sms.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    LoginModule,
    CaptchaModule,
    VerificationCodeModule,
  ],
  providers: [LoginSmsService],
  controllers: [LoginSmsController],
})
export class LoginSmsModule {}

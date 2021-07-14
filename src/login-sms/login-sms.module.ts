import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CaptchaModule } from '../captcha/captcha.module';
import { LoginSmsService } from './login-sms.service';
import { LoginSmsController } from './login-sms.controller';

@Module({
  imports: [AuthModule, UsersModule, CaptchaModule],
  providers: [LoginSmsService],
  controllers: [LoginSmsController],
})
export class LoginSmsModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CaptchaModule } from '../captcha/captcha.module';
import { LoginEmailService } from './login-email.service';
import { LoginEmailController } from './login-email.controller';

@Module({
  imports: [AuthModule, UsersModule, CaptchaModule],
  providers: [LoginEmailService],
  controllers: [LoginEmailController],
})
export class LoginEmailModule {}

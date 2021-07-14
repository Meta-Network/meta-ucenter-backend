import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { LoginModule } from '../login.module';
import { LoginEmailService } from './login-email.service';
import { LoginEmailController } from './login-email.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    LoginModule,
    CaptchaModule,
    VerificationCodeModule,
  ],
  providers: [LoginEmailService],
  controllers: [LoginEmailController],
})
export class LoginEmailModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { JWTCookieHelper } from './jwt-cookie-helper';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [LoginController],
  providers: [LoginService, JWTCookieHelper],
  exports: [LoginService, JWTCookieHelper],
})
export class LoginModule {}

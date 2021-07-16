import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { JWTCookieHelper } from './jwt-cookie-helper';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [UsersModule, AuthModule, AccountsModule],
  controllers: [LoginController],
  providers: [LoginService, JWTCookieHelper],
  exports: [LoginService, JWTCookieHelper],
})
export class LoginModule {}

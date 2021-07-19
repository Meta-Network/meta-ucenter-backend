import { Module } from '@nestjs/common';
import { Account } from '../entities/Account.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { JWTCookieHelper } from './jwt-cookie-helper';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([Account])],
  providers: [AccountsService, JWTCookieHelper],
  exports: [AccountsService, JWTCookieHelper],
})
export class AccountsModule {}

import { Module } from '@nestjs/common';
import { Account } from '../entities/Account.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { JWTCookieHelper } from './jwt-cookie-helper';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Account]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, JWTCookieHelper],
  exports: [AccountsService, JWTCookieHelper],
})
export class AccountsModule {}

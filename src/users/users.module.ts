import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuthModule } from 'src/two-factor-auth/two-factor-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TwoFactorAuthModule,
    AccountsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

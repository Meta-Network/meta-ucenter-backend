import { Module } from '@nestjs/common';
import { User } from '../entities/User.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuthModule } from 'src/two-factor-auth/two-factor-auth.module';

@Module({
  imports: [
    TwoFactorAuthModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

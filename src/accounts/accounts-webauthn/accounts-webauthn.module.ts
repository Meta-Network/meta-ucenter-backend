import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { AccountsWebauthnService } from './accounts-webauthn.service';
import { AccountsWebauthnController } from './accounts-webauthn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebAuthN } from '../../entities/WebAuthN.entity';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    UsersModule,
    CaptchaModule,
    VerificationCodeModule,
    AccountsModule,
    TypeOrmModule.forFeature([WebAuthN]),
  ],
  providers: [AccountsWebauthnService],
  controllers: [AccountsWebauthnController],
  exports: [AccountsWebauthnService],
})
export class AccountsWebauthnModule {}

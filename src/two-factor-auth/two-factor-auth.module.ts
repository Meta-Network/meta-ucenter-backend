import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { TwoFactorAuth } from '../entities/TwoFactorAuth.entity';
import { User } from '../entities/User.entity';
import { EmailStrategy } from './email.strategy';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { VcodeCacheModule } from 'src/vcode-cache/vcode-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TwoFactorAuth]),
    VerificationCodeModule,
    VcodeCacheModule,
    EmailModule,
  ],
  providers: [TwoFactorAuthService, EmailStrategy],
  exports: [TwoFactorAuthService],
  controllers: [TwoFactorAuthController],
})
export class TwoFactorAuthModule {}

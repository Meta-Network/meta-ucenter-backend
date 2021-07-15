import { Module } from '@nestjs/common';
import { VcodeCacheModule } from 'src/vcode-cache/vcode-cache.module';
import { VerificationCodeService } from './verification-code.service';

@Module({
  imports: [VcodeCacheModule],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}

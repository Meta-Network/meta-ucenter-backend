import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAuth } from 'src/entities/SocialAuth.entity';
import { SocialAuthService } from './social-auth.service';
import { SocialAuthController } from './social-auth.controller';
import { SocialAuthStrategyFactory } from './social-auth.strategy.factory';
import { GithubStrategy } from './github/github.strategy';
import { VcodeCacheModule } from '../vcode-cache/vcode-cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAuth]), VcodeCacheModule],
  controllers: [SocialAuthController],
  providers: [SocialAuthService, SocialAuthStrategyFactory, GithubStrategy],
})
export class SocialAuthModule {}
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VcodeCacheService } from './vcode-cache.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        auth_pass: configService.get('REDIS_PASS'),
        ttl: configService.get('REDIS_VCODE_TTL'),
        max: configService.get('REDIS_VCODE_MAX_ITEMS'),
      }),
    }),
  ],
  providers: [VcodeCacheService],
  // This is IMPORTANT,  you need to export RedisCacheService here so that other modules can use it
  exports: [VcodeCacheService],
})
export class VcodeCacheModule {}

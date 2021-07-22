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
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        auth_pass: configService.get('redis.pass'),
        ttl: configService.get('redis.vcode_ttl'),
        max: configService.get('redis.vcode_max_items'),
      }),
    }),
  ],
  providers: [VcodeCacheService],
  exports: [VcodeCacheService],
})
export class VcodeCacheModule {}

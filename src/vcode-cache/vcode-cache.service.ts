import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class VcodeCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T = any>(key: string) {
    return await this.cache.get<T>(key);
  }

  async set<T = any>(key: string, value: T) {
    await this.cache.set<T>(key, value);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async setWithTTL<T = any>(key: string, value: T, ttl: number) {
    await this.cache.set(key, value, { ttl });
  }
}

import { CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VcodeCacheService } from './vcode-cache.service';

describe('VcodeCacheService', () => {
  let service: VcodeCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [VcodeCacheService],
    }).compile();

    service = module.get<VcodeCacheService>(VcodeCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setWithTTL', () => {
    it('should be valid in ttl', async () => {
      jest.useFakeTimers();
      await service.setWithTTL('test_key', 123, 1);
      jest.advanceTimersByTime(800);
      const value = await service.get('test_key');
      expect(value).toBe(123);
    });
    it('should be undefined after expiration', async () => {
      jest.useFakeTimers();
      await service.setWithTTL('test_key', 123, 1);
      jest.advanceTimersByTime(1100);
      const value = await service.get('test_key');
      expect(value).toBeUndefined();
    });
  });
});

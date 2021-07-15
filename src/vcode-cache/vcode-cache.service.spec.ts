import { Test, TestingModule } from '@nestjs/testing';
import { VcodeCacheService } from './vcode-cache.service';

describe('RedisCacheService', () => {
  let service: VcodeCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VcodeCacheService],
    }).compile();

    service = module.get<VcodeCacheService>(VcodeCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

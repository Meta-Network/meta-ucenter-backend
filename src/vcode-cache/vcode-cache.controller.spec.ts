import { Test, TestingModule } from '@nestjs/testing';
import { VcodeCacheController } from './vcode-cache.controller';
import { VcodeCacheService } from './vcode-cache.service';

describe('RedisCacheController', () => {
  let controller: VcodeCacheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VcodeCacheController],
      providers: [VcodeCacheService],
    }).compile();

    controller = module.get<VcodeCacheController>(VcodeCacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

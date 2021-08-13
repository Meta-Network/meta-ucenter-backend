import { CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VcodeCacheService } from '../vcode-cache/vcode-cache.service';
import { VerificationCodeService } from './verification-code.service';

describe('VerificationCodeService', () => {
  let service: VerificationCodeService;
  let vcodeCacheService: VcodeCacheService;
  beforeEach(async () => {
    CacheModule.register();
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [VerificationCodeService, VcodeCacheService],
    }).compile();

    service = module.get<VerificationCodeService>(VerificationCodeService);
    vcodeCacheService = module.get<VcodeCacheService>(VcodeCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateVcode', () => {
    it('should be a numeric string of length 6', async () => {
      const result = await service.generateVcode('email', 'alice@ww.fan');
      expect(result).toMatch(/\d{6}/);
    });
    it('should cache value', async () => {
      const result = await service.generateVcode('email', 'alice@ww.fan');
      const cachedValue = await vcodeCacheService.get('email_alice@ww.fan');
      expect(result).toBe(cachedValue);
    });
  });

  describe('getVcode', () => {
    it('should be consistent with the generated code', async () => {
      const prefix = 'email';
      const key = 'alice@ww.fan';
      const generatedCode = await service.generateVcode(prefix, key);
      const result = await service.getVcode(prefix, key);
      expect(result).toBe(generatedCode);
    });
  });

  describe('verify', () => {
    it('should return true if the code is the same as the generated code', async () => {
      const prefix = 'email';
      const key = 'alice@ww.fan';
      const generatedCode = await service.generateVcode(prefix, key);
      const result = await service.verify(prefix, key, generatedCode);
      expect(result).toBe(true);
    });

    it('should return false if the code is different as the generated code', async () => {
      const prefix = 'email';
      const key = 'alice@ww.fan';
      const generatedCode = await service.generateVcode(prefix, key);
      const result = await service.verify(prefix, key, 'abcdef');
      expect(result).toBe(false);
    });
  });
});

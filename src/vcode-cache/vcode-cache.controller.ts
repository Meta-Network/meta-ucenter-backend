import { Controller } from '@nestjs/common';
import { VcodeCacheService } from './vcode-cache.service';

@Controller('redis-cache')
export class VcodeCacheController {
  constructor(private readonly redisCacheService: VcodeCacheService) {}
}

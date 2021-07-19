import { Test, TestingModule } from '@nestjs/testing';
import { AccountsSmsService } from './accounts-sms.service';

describe('LoginSmsService', () => {
  let service: AccountsSmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsSmsService],
    }).compile();

    service = module.get<AccountsSmsService>(AccountsSmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AccountsTokenService } from './accounts-token.service';

describe('AccountsTokenService', () => {
  let service: AccountsTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsTokenService],
    }).compile();

    service = module.get<AccountsTokenService>(AccountsTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

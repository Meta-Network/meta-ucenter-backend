import { Test, TestingModule } from '@nestjs/testing';
import { AccountsMetamaskService } from './accounts-metamask.service';

describe('accountsEmailService', () => {
  let service: AccountsMetamaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsMetamaskService],
    }).compile();

    service = module.get<AccountsMetamaskService>(AccountsMetamaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

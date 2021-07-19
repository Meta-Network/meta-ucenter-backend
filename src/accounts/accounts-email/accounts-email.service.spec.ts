import { Test, TestingModule } from '@nestjs/testing';
import { AccountsEmailService } from './accounts-email.service';

describe('accountsEmailService', () => {
  let service: AccountsEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsEmailService],
    }).compile();

    service = module.get<AccountsEmailService>(AccountsEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

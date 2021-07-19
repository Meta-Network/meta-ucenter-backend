import { Test, TestingModule } from '@nestjs/testing';
import { AccountsEmailController } from './accounts-email.controller';
import { AccountsEmailService } from './accounts-email.service';

describe('accountsEmailController', () => {
  let controller: AccountsEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsEmailController],
      providers: [AccountsEmailService],
    }).compile();

    controller = module.get<AccountsEmailController>(AccountsEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

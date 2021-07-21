import { Test, TestingModule } from '@nestjs/testing';
import { AccountsMetamaskController } from './accounts-metamask.controller';
import { AccountsMetamaskService } from './accounts-metamask.service';

describe('accountsEmailController', () => {
  let controller: AccountsMetamaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsMetamaskController],
      providers: [AccountsMetamaskService],
    }).compile();

    controller = module.get<AccountsMetamaskController>(AccountsMetamaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

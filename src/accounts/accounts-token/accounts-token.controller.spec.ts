import { Test, TestingModule } from '@nestjs/testing';
import { AccountsTokenController } from './accounts-token.controller';
import { AccountsTokenService } from './accounts-token.service';

describe('AccountsTokenController', () => {
  let controller: AccountsTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsTokenController],
      providers: [AccountsTokenService],
    }).compile();

    controller = module.get<AccountsTokenController>(AccountsTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

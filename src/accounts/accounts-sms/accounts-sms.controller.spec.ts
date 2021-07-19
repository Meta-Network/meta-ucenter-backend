import { Test, TestingModule } from '@nestjs/testing';
import { AccountsSmsController } from './accounts-sms.controller';
import { AccountsSmsService } from './accounts-sms.service';

describe('LoginSmsController', () => {
  let controller: AccountsSmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsSmsController],
      providers: [AccountsSmsService],
    }).compile();

    controller = module.get<AccountsSmsController>(AccountsSmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';

describe('AccountsController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService],
    }).compile();
  });
});

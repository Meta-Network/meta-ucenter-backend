import { Test, TestingModule } from '@nestjs/testing';
import { InvitationHandlerService } from './invitation-handler.service';

describe('InvitationHandlerService', () => {
  let service: InvitationHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationHandlerService],
    }).compile();

    service = module.get<InvitationHandlerService>(InvitationHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

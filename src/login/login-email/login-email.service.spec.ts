import { Test, TestingModule } from '@nestjs/testing';
import { LoginEmailService } from './login-email.service';

describe('LoginEmailService', () => {
  let service: LoginEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginEmailService],
    }).compile();

    service = module.get<LoginEmailService>(LoginEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

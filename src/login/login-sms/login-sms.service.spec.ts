import { Test, TestingModule } from '@nestjs/testing';
import { LoginSmsService } from './login-sms.service';

describe('LoginSmsService', () => {
  let service: LoginSmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginSmsService],
    }).compile();

    service = module.get<LoginSmsService>(LoginSmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

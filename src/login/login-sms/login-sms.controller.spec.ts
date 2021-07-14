import { Test, TestingModule } from '@nestjs/testing';
import { LoginSmsController } from './login-sms.controller';
import { LoginSmsService } from './login-sms.service';

describe('LoginSmsController', () => {
  let controller: LoginSmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginSmsController],
      providers: [LoginSmsService],
    }).compile();

    controller = module.get<LoginSmsController>(LoginSmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

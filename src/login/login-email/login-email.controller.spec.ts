import { Test, TestingModule } from '@nestjs/testing';
import { LoginEmailController } from './login-email.controller';
import { LoginEmailService } from './login-email.service';

describe('LoginEmailController', () => {
  let controller: LoginEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginEmailController],
      providers: [LoginEmailService],
    }).compile();

    controller = module.get<LoginEmailController>(LoginEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

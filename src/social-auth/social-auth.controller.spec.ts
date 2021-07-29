import { Test, TestingModule } from '@nestjs/testing';
import { SocialAuthController } from './social-auth.controller';
import { SocialAuthService } from './social-auth.service';

describe('SocialAuthController', () => {
  let controller: SocialAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialAuthController],
      providers: [SocialAuthService],
    }).compile();

    controller = module.get<SocialAuthController>(SocialAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

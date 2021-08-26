import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'src/entities/User.entity';
import { AuthorizeRequestDto } from './dto/authorize-request.dto';
import { SocialAuthStrategyFactory } from './social-auth.strategy.factory';
import { AuthorizeCallbackDto } from './dto/authorize-callback.dto';

@Injectable()
export class SocialAuthService {
  constructor(private strategyFactory: SocialAuthStrategyFactory) {}

  private use(platform: string) {
    return this.strategyFactory.getService(platform);
  }

  async authorizeRequest(
    platform: string,
    authorizeRequestDto: AuthorizeRequestDto,
    user: User,
    request: Request,
  ) {
    return this.use(platform).authorizeRequest(
      authorizeRequestDto,
      user,
      request,
    );
  }

  async authorizeCallback(
    platform: string,
    authorizeCallbackDto: AuthorizeCallbackDto,
    user: User,
    response: Response,
    request: Request,
  ) {
    return this.use(platform).authorizeCallback(
      authorizeCallbackDto,
      user,
      response,
      request,
    );
  }

  async getToken(platform: string, userId: number): Promise<string> {
    return this.use(platform).getToken(userId);
  }

  async refreshToken(platform: string, userId: number): Promise<void> {
    return this.use(platform).refreshToken(userId);
  }
}

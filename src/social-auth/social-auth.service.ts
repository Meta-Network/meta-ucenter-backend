import { BadRequestException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'src/entities/User.entity';
import { AuthorizeRequestDto } from './dto/authorize-request.dto';
import { SocialAuthStrategyFactory } from './social-auth.strategy.factory';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Events from '../events';
import { ConfigService } from '../config/config.service';
import matatakiGetUsername from './matataki/matataki.get-username';

@Injectable()
export class SocialAuthService {
  constructor(
    private strategyFactory: SocialAuthStrategyFactory,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  private use(platform: string) {
    try {
      return this.strategyFactory.getService(platform);
    } catch (err) {
      throw new BadRequestException(
        'This platform is not supported or does not exist.',
      );
    }
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
    authorizeCallbackDto: any,
    user: User,
    response: Response,
    request: Request,
  ): Promise<string> {
    const token = await this.use(platform).authorizeCallback(
      authorizeCallbackDto,
      user,
      response,
      request,
    );
    if (
      this.configService
        .getBiz<string[]>('spider_platform_allowlist')
        .includes(platform)
    ) {
      let username: string;
      if (platform === 'matataki') {
        username = await matatakiGetUsername(token);
      }
      // Emit bound social-auth event to meta cms
      this.eventEmitter.emit(Events.UserBoundSocialAuth, {
        userId: user.id,
        platform,
        username,
        token,
      });
    }
    return token;
  }

  async getToken(platform: string, userId: number): Promise<string> {
    return this.use(platform).getToken(userId);
  }

  async refreshToken(platform: string, userId: number): Promise<void> {
    return this.use(platform).refreshToken(userId);
  }

  async deleteToken(platform: string, userId: number): Promise<void> {
    this.eventEmitter.emit(Events.UserUnboundSocialAuth, {
      userId,
      platform,
    });
    return this.use(platform).deleteToken(userId);
  }
}

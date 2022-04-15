import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import Events from '../events';
import { SocialAuthBoundMessage } from '../type';

@Injectable()
export class MicroservicesService {
  constructor(
    @Inject('CMS_MS_CLIENT') private readonly cmsClient: ClientProxy,
  ) {}

  @OnEvent(Events.UserBoundSocialAuth)
  async handleUserBoundSocialAuth(payload: SocialAuthBoundMessage) {
    this.cmsClient.emit<void>(Events.UserBoundSocialAuth, payload);
  }

  @OnEvent(Events.UserUnboundSocialAuth)
  async handleUserUnboundSocialAuth(payload: SocialAuthBoundMessage) {
    this.cmsClient.emit<void>(Events.UserUnboundSocialAuth, payload);
  }

  async onApplicationBootstrap() {
    await this.cmsClient.connect();
  }
}

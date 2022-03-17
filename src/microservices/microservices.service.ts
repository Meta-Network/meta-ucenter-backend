import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../entities/User.entity';
import Events from '../events';
import { SocialAuthBoundMessage, UserInvitationCountPayload } from '../type';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';

@Injectable()
export class MicroservicesService {
  constructor(
    @Inject('NETWORK_MS_CLIENT') private readonly networkClient: ClientProxy,
    @Inject('CMS_MS_CLIENT') private readonly cmsClient: ClientProxy,
  ) {}

  @OnEvent(Events.UserProfileModified)
  async handleUserProfileModified(payload: User & { inviter_user_id }) {
    this.networkClient.emit<void>(Events.UserProfileModified, payload);
  }

  @OnEvent(Events.UserBoundSocialAuth)
  async handleUserBoundSocialAuth(payload: SocialAuthBoundMessage) {
    this.cmsClient.emit<void>(Events.UserBoundSocialAuth, payload);
  }

  @OnEvent(Events.UserUnboundSocialAuth)
  async handleUserUnboundSocialAuth(payload: SocialAuthBoundMessage) {
    this.cmsClient.emit<void>(Events.UserUnboundSocialAuth, payload);
  }

  @OnEvent(Events.UserInvitationCountUpdated)
  async handleUserInvitationCountUpdated(payload: UserInvitationCountPayload) {
    const result = new MetaInternalResult<UserInvitationCountPayload>({
      serviceCode: ServiceCode.UCENTER,
    });
    result.data = payload;
    this.cmsClient.emit<void>(Events.UserInvitationCountUpdated, result);
  }

  async onApplicationBootstrap() {
    await this.cmsClient.connect();
    await this.networkClient.connect();
  }
}

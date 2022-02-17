import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from 'src/config/config.service';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from './entities/User.entity';
import Events from './events';
import { SocialAuthBoundMessage, UserInvitationCountPayload } from './type';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('NETWORK_MS_CLIENT') private readonly networkClient: ClientProxy,
    @Inject('CMS_MS_CLIENT') private readonly cmsClient: ClientProxy,
  ) {}

  getHello() {
    return 'Hello World!';
  }

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
    this.cmsClient.emit<void>(Events.UserInvitationCountUpdated, payload);
  }

  async onApplicationBootstrap() {
    await this.networkClient.connect();
  }
}

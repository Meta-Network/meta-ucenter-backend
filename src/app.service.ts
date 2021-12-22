import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from 'src/config/config.service';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from './entities/User.entity';
import Events from './events';
import { SocialAuthBoundMessage } from './type';

@Injectable()
export class AppService {
  private readonly logger = new Logger(this.constructor.name);
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
    this.logger.log(`UserProfileModified event sent.`);
    console.log(payload);
    return this.networkClient.emit<void>(Events.UserProfileModified, payload);
  }

  @OnEvent(Events.UserBoundSocialAuth)
  async handleUserBoundSocialAuth(payload: SocialAuthBoundMessage) {
    this.logger.log(
      `Emitting event ${Events.UserBoundSocialAuth} with payload below.`,
    );
    console.log(payload);
    return this.cmsClient.emit<void>(Events.UserBoundSocialAuth, payload);
  }

  @OnEvent(Events.UserUnboundSocialAuth)
  async handleUserUnboundSocialAuth(payload: SocialAuthBoundMessage) {
    this.logger.log(
      `Emitting event ${Events.UserUnboundSocialAuth} with payload below.`,
    );
    console.log(payload);
    return this.cmsClient.emit<void>(Events.UserUnboundSocialAuth, payload);
  }

  async onApplicationBootstrap() {
    await this.networkClient.connect();
  }
}

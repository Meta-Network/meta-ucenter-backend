import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from './entities/User.entity';
import Events from './events';

@Injectable()
export class AppService {
  constructor(
    @Inject('NETWORK_MS_CLIENT') private readonly networkClient: ClientProxy,
  ) {}

  getHello() {
    return 'Hello World!';
  }

  @OnEvent(Events.UserProfileModified)
  async handleUserProfileModified(payload: User) {
    return this.networkClient.emit<void>(Events.UserProfileModified, payload);
  }

  async onApplicationBootstrap() {
    await this.networkClient.connect();
  }
}

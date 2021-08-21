import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from 'src/config/config.service';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from './entities/User.entity';
import Events from './events';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('NETWORK_MS_CLIENT') private readonly networkClient: ClientProxy,
  ) {}

  getHello() {
    return this.configService.get<string>('test.hello') || 'Hello World!';
  }

  @OnEvent(Events.UserProfileModified)
  async handleUserProfileModified(payload: User) {
    return this.networkClient.emit<void>(Events.UserProfileModified, payload);
  }

  async onApplicationBootstrap() {
    await this.networkClient.connect();
  }
}

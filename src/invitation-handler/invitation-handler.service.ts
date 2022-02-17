import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/entities/User.entity';
import { ConfigService } from '../config/config.service';
import { InvitationService } from 'src/invitation/invitation.service';
import dayjs from 'dayjs';
import Events from '../events';

@Injectable()
export class InvitationHandlerService {
  constructor(
    private invitationService: InvitationService,
    private configService: ConfigService,
  ) {}

  @OnEvent(Events.UserCreated)
  async handleUserCreated(payload: User) {
    const count = this.configService.getBiz<number>(
      'invitation.new_when_created_user',
    );

    if (count) {
      await this.invitationService.createMultiple(count, {
        sub: '',
        message: '',
        cause: Events.UserCreated,
        inviter_user_id: payload.id,
        matataki_user_id: 0,
        expired_at: dayjs().add(2, 'month').toDate(),
      });
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(InvitationHandlerService.name);

  @OnEvent(Events.UserCreated)
  async handleUserCreated(payload: User) {
    this.logger.log('handleUserCreated', User);

    const newInvitationDto = {
      sub: '',
      message: '',
      cause: Events.UserCreated,
      inviter_user_id: payload.id,
      matataki_user_id: 0,
      expired_at: dayjs().add(2, 'month').toDate(),
    };

    const newInvitations = this.configService.getBiz(
      'user.invitation_when_created',
    );

    for (
      let i = this.configService.getBiz('user.invitation_when_created') || 0;
      i < newInvitations;
      i++
    ) {
      await this.invitationService.create(newInvitationDto);
    }
  }
}

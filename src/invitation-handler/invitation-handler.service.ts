import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/entities/User.entity';
import { InvitationService } from 'src/invitation/invitation.service';
import dayjs from 'dayjs';

@Injectable()
export class InvitationHandlerService {
  constructor(
    private invitationService: InvitationService,
  ) {}

  private readonly logger = new Logger(InvitationHandlerService.name);

  @OnEvent('user.created')
  async handleUserCreated(payload: User) {
    this.logger.log('handleUserCreated', User);

    const newInvitationDto = {
      sub: '',
      message: '',
      inviter_user_id: payload.id,
      matataki_user_id: 0,
      expired_at: dayjs().add(2, 'month').toDate(),
    };

    // TODO: make this configurable
    const newInvitations = 3;

    for (let i = 0; i < newInvitations; i++) {
      await this.invitationService.createInvitation(newInvitationDto);
    }
  }
}

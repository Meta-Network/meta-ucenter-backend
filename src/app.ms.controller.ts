import { Controller } from '@nestjs/common';
import { CreateInvitationDto } from './invitation/dto/create-invitation.dto';
import { InvitationService } from './invitation/invitation.service';
import {
  Payload,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import Events from './events';
import { User } from './entities/User.entity';
import { UsersService } from './users/users.service';

@Controller()
export class AppMsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationService: InvitationService,
  ) {}
  @MessagePattern('hello')
  getNotifications() {
    return 'This is microservice from ucenter says: Hello World!';
  }

  @MessagePattern(Events.SyncUserProfile)
  async syncUserProfile(
    @Payload() query: { min: number; max: number },
  ): Promise<User[]> {
    const { min, max } = query;
    return this.usersService.fetchUsers(min, max);
  }

  @EventPattern('newInvitationSlot')
  async handleNewInvitation(newInvitationDto: CreateInvitationDto) {
    await this.invitationService.createInvitation(newInvitationDto);
  }
}

import { Controller } from '@nestjs/common';
import { CreateInvitationDto } from './invitation/dto/create-invitation.dto';
import { InvitationService } from './invitation/invitation.service';
import { Payload, EventPattern, MessagePattern } from '@nestjs/microservices';
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

  @MessagePattern('syncUserProfile')
  async syncUserProfile(
    @Payload()
    queries: {
      userIdMin?: number;
      userIdMax?: number;
      modifiedAfter?: Date;
    },
  ): Promise<User[] | string> {
    return this.usersService.fetchUsers(queries);
  }

  @EventPattern('newInvitationSlot')
  async handleNewInvitation(newInvitationDto: CreateInvitationDto) {
    await this.invitationService.createInvitation(newInvitationDto);
  }
}

import { Controller } from '@nestjs/common';
import { CreateInvitationDto } from './invitation/dto/create-invitation.dto';
import { InvitationService } from './invitation/invitation.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppMsController {
  constructor(
    private readonly invitationService: InvitationService,
  ) {}
  @MessagePattern({ cmd: 'hello' })
  getHello(): string {
    return 'Hello World!';
  }

  @EventPattern('new_invitation_slot')
  async handleNewInvitation(newInvitationDto: CreateInvitationDto) {
    await this.invitationService.createInvitation(newInvitationDto);
  }
}

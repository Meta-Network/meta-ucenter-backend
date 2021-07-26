import { Body, Controller, Post } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationDto } from './dto/invitation.dto';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}
  // TODO: remove this controller in production
  @Post()
  async generateInvitation(@Body() invitationDto: InvitationDto) {
    return this.invitationService.createInvitation(invitationDto);
  }
}

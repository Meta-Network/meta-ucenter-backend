import { Module } from '@nestjs/common';
import { InvitationHandlerService } from './invitation-handler.service';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [InvitationModule],
  providers: [InvitationHandlerService],
})
export class InvitationHandlerModule {}

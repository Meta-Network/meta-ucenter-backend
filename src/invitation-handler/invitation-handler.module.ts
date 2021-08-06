import { Module } from '@nestjs/common';
import { InvitationHandlerService } from './invitation-handler.service';

@Module({
  providers: [InvitationHandlerService],
})
export class InvitationHandlerModule {}

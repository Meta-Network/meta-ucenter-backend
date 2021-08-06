import { Module } from '@nestjs/common';
import { InvitationHandlerService } from './invitation-handler.service';
import { InvitationHandlerController } from './invitation-handler.controller';

@Module({
  controllers: [InvitationHandlerController],
  providers: [InvitationHandlerService]
})
export class InvitationHandlerModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { Invitation } from 'src/entities/Invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation])],
  providers: [InvitationService],
  controllers: [InvitationController],
  exports: [InvitationService],
})
export class InvitationModule {}

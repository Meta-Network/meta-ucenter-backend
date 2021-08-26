import { Controller, HttpStatus } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users/users.service';
import { InvitationService } from './invitation/invitation.service';
import { SocialAuthService } from './social-auth/social-auth.service';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { CreateInvitationDto } from './invitation/dto/create-invitation.dto';

@Controller()
export class AppMsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationService: InvitationService,
    private socialAuthService: SocialAuthService,
  ) {}
  @MessagePattern('hello')
  getNotifications() {
    return 'This is microservice from ucenter says: Hello World!';
  }

  @MessagePattern('getSocialAuthTokenByUserId')
  async getSocialAuthTokenByUserId(
    @Payload()
    payload: {
      platform: string;
      userId: number;
    },
  ): Promise<MetaInternalResult> {
    const result = new MetaInternalResult({
      serviceCode: ServiceCode.UCENTER,
    });

    try {
      result.data = await this.socialAuthService.getToken(
        payload.platform,
        payload.userId,
      );
    } catch (error) {
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = error.message;
    }

    return result;
  }

  @MessagePattern('syncUserProfile')
  async syncUserProfile(
    @Payload()
    queries: {
      userIdMin?: number;
      userIdMax?: number;
      modifiedAfter?: Date;
    },
  ): Promise<MetaInternalResult> {
    return this.usersService.fetchUsers(queries);
  }

  @EventPattern('newInvitationSlot')
  async handleNewInvitation(newInvitationDto: CreateInvitationDto) {
    await this.invitationService.createInvitation(newInvitationDto);
  }
}

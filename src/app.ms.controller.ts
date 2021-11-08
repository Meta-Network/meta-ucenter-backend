import { Controller, HttpStatus } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users/users.service';
import { InvitationService } from './invitation/invitation.service';
import { SocialAuthService } from './social-auth/social-auth.service';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { Invitation } from './entities/Invitation.entity';
import { User } from './entities/User.entity';
import { CreateInvitationDto } from './invitation/dto/create-invitation.dto';
import { UpdateInvitationDto } from './invitation/dto/update-invitation.dto';
import { UpdateResult } from 'typeorm';

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
  ): Promise<MetaInternalResult<string>> {
    const result = new MetaInternalResult<string>({
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
  ): Promise<MetaInternalResult<(User & { inviter_user_id: string })[]>> {
    return this.usersService.fetchUsers(queries);
  }

  @MessagePattern('findInvitations')
  async findInvitations(
    @Payload()
    conditions: any,
  ): Promise<MetaInternalResult<Invitation[]>> {
    const result = new MetaInternalResult<Invitation[]>({
      serviceCode: ServiceCode.UCENTER,
    });

    result.data = await this.invitationService.find(conditions);
    return result;
  }

  @MessagePattern('createMultipleInvitations')
  async createMultipleInvitations(
    @Payload()
    payload: {
      numbers: number;
      invitationDto: CreateInvitationDto;
    },
  ): Promise<MetaInternalResult<void>> {
    const result = new MetaInternalResult<void>({
      serviceCode: ServiceCode.UCENTER,
    });

    try {
      await this.invitationService.createMultiple(
        payload.numbers,
        payload.invitationDto,
      );
    } catch (e) {
      result.statusCode = 500;
      console.log(e);
    }
    return result;
  }

  @MessagePattern('updateMultipleInvitations')
  async updateMultipleInvitations(
    @Payload()
    payload: {
      ids: number[];
      updateInvitationDto: UpdateInvitationDto;
    },
  ): Promise<MetaInternalResult<UpdateResult>> {
    const result = new MetaInternalResult<UpdateResult>({
      serviceCode: ServiceCode.UCENTER,
    });
    try {
      result.data = await this.invitationService.updateMultiple(
        payload.ids,
        payload.updateInvitationDto,
      );
    } catch (e) {
      result.statusCode = 500;
      console.log(e);
    }
    return result;
  }

  @EventPattern('newInvitationSlot')
  async handleNewInvitation(newInvitationDto: CreateInvitationDto) {
    await this.invitationService.create(newInvitationDto);
  }
}

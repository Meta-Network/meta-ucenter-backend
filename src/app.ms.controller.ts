import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users/users.service';
import { InvitationService } from './invitation/invitation.service';
import { SocialAuthService } from './social-auth/social-auth.service';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { Invitation } from './entities/Invitation.entity';
import { ConfigService } from './config/config.service';
import { User } from './entities/User.entity';
import { CreateInvitationDto } from './invitation/dto/create-invitation.dto';
import { UpdateInvitationDto } from './invitation/dto/update-invitation.dto';
import { In } from 'typeorm';
import dayjs from 'dayjs';

@Controller()
export class AppMsController {
  private readonly logger = new Logger(AppMsController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationService: InvitationService,
    private readonly socialAuthService: SocialAuthService,
    private readonly configService: ConfigService,
  ) {}
  @MessagePattern('hello')
  getNotifications() {
    return 'This is microservice from ucenter says: Hello World!';
  }

  @MessagePattern('getUserInfo')
  async getUserInfo(
    @Payload()
    userId: number,
  ): Promise<MetaInternalResult<User>> {
    const result = new MetaInternalResult<User>({
      serviceCode: ServiceCode.UCENTER,
    });
    try {
      result.data = await this.usersService.getUserInfo(userId);
    } catch (error) {
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = error.message;
    }
    return result;
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
    payload: {
      ids: number[];
    },
  ): Promise<MetaInternalResult<Invitation[]>> {
    const result = new MetaInternalResult<Invitation[]>({
      serviceCode: ServiceCode.UCENTER,
    });
    result.data = await this.invitationService.find({
      where: { id: In(payload.ids) },
    });
    return result;
  }

  @MessagePattern('createMultipleInvitations')
  async createMultipleInvitations(
    @Payload()
    payload: {
      numbers: number;
      invitationDto: CreateInvitationDto;
    },
  ): Promise<MetaInternalResult<Invitation[]>> {
    const result = new MetaInternalResult<Invitation[]>({
      serviceCode: ServiceCode.UCENTER,
    });

    try {
      result.data = await this.invitationService.createMultiple(
        payload.numbers,
        payload.invitationDto,
      );
    } catch (e) {
      result.statusCode = 500;
      result.message = e;
      this.logger.error('createMultipleInvitations', e);
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
  ): Promise<MetaInternalResult<Invitation[]>> {
    const result = new MetaInternalResult<Invitation[]>({
      serviceCode: ServiceCode.UCENTER,
    });
    try {
      result.data = await this.invitationService.updateMultiple(
        payload.ids,
        payload.updateInvitationDto,
      );
    } catch (e) {
      result.statusCode = 500;
      result.message = e;
      this.logger.error('updateMultipleInvitations', e);
    }
    return result;
  }

  // TODO: this function name doesn't fit the event it handles
  @EventPattern('newInvitationSlot')
  async handleNewInvitation(newInvitationDto: CreateInvitationDto) {
    const count = this.configService.getBiz<number>(
      'invitation.new_when_occupied_hex_grids',
    );

    if (count) {
      await this.invitationService.createMultiple(count, newInvitationDto);
    }
  }

  @EventPattern('meta.space.site.created')
  async handleMetaSpaceCreated(siteInfo: { userId: number }) {
    const count = this.configService.getBiz<number>(
      'invitation.new_when_created_meta_space',
    );

    if (count) {
      this.logger.log('New meta space created by user', siteInfo.userId);
      this.logger.log(`Generating ${count} invitation codes for the user.`);

      await this.invitationService.createMultiple(count, {
        sub: '',
        message: '',
        inviter_user_id: siteInfo.userId,
        cause: 'created.metaspace',
        matataki_user_id: 0,
        expired_at: dayjs().add(1, 'month').toDate(),
      });
    }
  }
}

import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { SocialAuthService } from '../social-auth/social-auth.service';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { User } from '../entities/User.entity';

@Controller()
export class MicroservicesController {
  private readonly logger = new Logger(MicroservicesController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly socialAuthService: SocialAuthService,
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
}

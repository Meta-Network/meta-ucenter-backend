import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { User } from 'src/entities/User.entity';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { CurrentUser } from 'src/users/user.decorator';
import { SocialAuthService } from './social-auth.service';
import { AuthorizeRequestDto } from './dto/authorize-request.dto';
// import { AuthorizeCallbackDto } from './dto/authorize-callback.dto';

@ApiTags('SocialAuth')
@Controller('social-auth')
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @ApiCreatedResponse({
    description: '返回 platform 对应的邀请链接',
  })
  @UseGuards(JWTAuthGuard)
  @Post(':platform/authorize-request')
  async authorizeRequest(
    @Param('platform') platform: string,
    @Body() authorizeRequestDto: AuthorizeRequestDto,
    @CurrentUser() user: User,
  ) {
    return await this.socialAuthService.authorizeRequest(
      platform,
      authorizeRequestDto,
      user,
    );
  }

  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @UseGuards(JWTAuthGuard)
  @Get(':platform/authorize-callback')
  async authorizeCallback(
    @Param('platform') platform: string,
    // DTO is not working here
    @Query() authorizeCallbackDto: any, // AuthorizeCallbackDto,
    @CurrentUser() user: User,
    @Res() res,
  ) {
    return await this.socialAuthService.authorizeCallback(
      platform,
      authorizeCallbackDto,
      user,
      res,
    );
  }

  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @UseGuards(JWTAuthGuard)
  @Get(':platform/token')
  async getToken(
    @Param('platform') platform: string,
    @CurrentUser() user: User,
  ) {
    return await this.socialAuthService.getToken(platform, user);
  }
}

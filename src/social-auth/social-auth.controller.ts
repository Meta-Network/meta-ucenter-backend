import {
  Get,
  Res,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Controller,
  Patch,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { User } from 'src/entities/User.entity';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { CurrentUser } from 'src/users/user.decorator';
import { SocialAuthService } from './social-auth.service';
import { AuthorizeRequestDto } from './dto/authorize-request.dto';
// import { AuthorizeCallbackDto } from './dto/authorize-callback.dto';

@ApiCookieAuth()
@ApiTags('Social Auth')
@Controller('social-auth')
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @Post(':platform/authorize-request')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '前端请求一个进行 OAuth 验证的链接' })
  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @ApiCreatedResponse({ description: '返回 platform 对应的邀请链接' })
  async authorizeRequest(
    @Param('platform') platform: string,
    @Body() authorizeRequestDto: AuthorizeRequestDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ) {
    return await this.socialAuthService.authorizeRequest(
      platform,
      authorizeRequestDto,
      user,
      request,
    );
  }

  @Get(':platform/authorize-callback')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '由对方服务器访问的回传接口' })
  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @ApiOkResponse({ description: '保存对应的 token，不返回 data' })
  async authorizeCallback(
    @Param('platform') platform: string,
    // DTO is not working here
    @Query() authorizeCallbackDto: any, // AuthorizeCallbackDto,
    @CurrentUser() user: User,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    await this.socialAuthService.authorizeCallback(
      platform,
      authorizeCallbackDto,
      user,
      response,
      request,
    );
  }

  @Get(':platform/token')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '返回已经保存的 OAuth token' })
  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @ApiOkResponse({ description: '返回名为 token 的键值对' })
  async getToken(
    @Param('platform') platform: string,
    @CurrentUser() user: User,
  ): Promise<{ token: string }> {
    return { token: await this.socialAuthService.getToken(platform, user.id) };
  }

  @Patch(':platform/refresh')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '对指定平台的 token 刷新有效期' })
  @ApiParam({
    name: 'platform',
    required: true,
    description: '指定进行认证的平台',
  })
  @ApiOkResponse({ description: '不返回任何值（暂时。应改为返回刷新的结果）' })
  async refreshToken(
    @Param('platform') platform: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.socialAuthService.refreshToken(platform, user.id);
  }
}

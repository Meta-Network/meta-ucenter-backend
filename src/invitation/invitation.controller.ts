import {
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JWTDecodedUser } from '../type';
import { JWTAuthGuard } from '../auth/jwt.guard';
import { InvitationService } from './invitation.service';
import { CurrentUser } from '../users/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Invitation } from '../entities/Invitation.entity';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('mine')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: '获取当前用户拥有的邀请码' })
  @ApiOkResponse({ description: '返回邀请码数据结构的数组' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async findMyInvitations(
    @CurrentUser() user: JWTDecodedUser,
  ): Promise<Invitation[]> {
    return this.invitationService.findByInviterId(user.id);
  }

  @Patch(':signature/message')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: '修改该用户所拥有的邀请码的邀请信息' })
  @ApiOkResponse({ description: '返回修改后的邀请信息' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async updateMyInvitationMessage(
    @Param('signature') signature: string,
    @CurrentUser() user: JWTDecodedUser,
    @Body() updateInvitationDto: UpdateInvitationDto,
  ): Promise<Invitation> {
    return this.invitationService.updateMyInvitationMessage(
      user.id,
      signature,
      updateInvitationDto,
    );
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '校验邀请码的可用性' })
  @ApiOkResponse({ description: '返回的邀请码存在和可用信息' })
  async validateInvitation(
    @Body() validateInvitationDto: ValidateInvitationDto,
  ): Promise<{ exists: boolean; available: boolean }> {
    return this.invitationService.validateInvitation(validateInvitationDto);
  }
}

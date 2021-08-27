import { Post, Controller, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../users/user.decorator';
import { JWTAuthGuard } from '../auth/jwt.guard';
import { JWTDecodedUser } from '../type';
import { StorageService } from './storage.service';

@ApiTags('Accounts Token')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('token')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '获取一个可用于访问存储的签名' })
  @ApiCreatedResponse({ description: '返回可用于访问远程存储的签名' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async signToken(@CurrentUser() user: JWTDecodedUser): Promise<string> {
    return await this.storageService.signToken(user);
  }
}

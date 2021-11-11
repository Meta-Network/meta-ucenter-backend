import { Get, Controller, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/utils/user.decorator';
import { AccountsService } from './accounts.service';
import { JWTDecodedUser } from '../type';
import { Account } from 'src/entities/Account.entity';
import { JWTAuthGuard } from '../auth/jwt.guard';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('mine')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '获取用户的所有 account 列表' })
  @ApiOkResponse({ description: '返回用户的所有 account 列表' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async getMyAccounts(@CurrentUser() user: JWTDecodedUser): Promise<Account[]> {
    return await this.accountsService.find({ user_id: user.id });
  }
}

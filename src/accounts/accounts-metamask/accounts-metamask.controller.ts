import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AccountsService } from '../accounts.service';
import { AccountsMetaMaskDto } from './dto/accounts-metamask.dto';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { User } from 'src/entities/User.entity';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { CurrentUser } from 'src/users/user.decorator';
import { Account } from '../../entities/Account.entity';
import { AccountsManager } from '../accounts.manager';

@ApiTags('Accounts')
@Controller('accounts/metamask')
export class AccountsMetamaskController {
  private logger = new Logger(AccountsMetamaskController.name);
  constructor(
    private readonly accountsManager: AccountsManager,
    private readonly accountsMetamaskService: AccountsMetamaskService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  @ApiOperation({ summary: '返回一段随机数供前端 API 进行签名，用于登录校验' })
  @ApiCreatedResponse({ description: '在缓存中保存并回传校验码' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  async generateVerificationCodeForMetaMask(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ code }> {
    const code = await this.accountsMetamaskService.generateMetamaskNonce(
      verifyCode.key,
    );
    return { code };
  }

  @Post('login')
  @ApiOperation({ summary: '以 MetaMask 钱包登录到现有账号' })
  @ApiCreatedResponse({
    description: '返回登录的用户信息。并在 Cookies 中写入 access_token',
  })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsMetaMaskDto: AccountsMetaMaskDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsManager.login(
      accountsMetaMaskDto,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('/bind')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '绑定一个未注册的 MetaMask 账号到本用户' })
  @ApiCreatedResponse({ description: '绑定并返回账号信息' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async bind(
    @CurrentUser() user: User,
    @Body() accountsMetaMaskDto: AccountsMetaMaskDto,
  ): Promise<Account> {
    return this.accountsManager.bindAccount(accountsMetaMaskDto, user.id);
  }

  @Post('/unbind')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '解绑本用户的现有 MetaMask 账户' })
  @ApiCreatedResponse({ description: '完成解绑，不返回 data' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async unbind(@Body() accountsMetaMaskDto: AccountsMetaMaskDto) {
    return this.accountsManager.unbindAccount(accountsMetaMaskDto);
  }
}

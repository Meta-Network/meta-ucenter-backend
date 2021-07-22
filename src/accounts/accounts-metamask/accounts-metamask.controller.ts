import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AccountsMetaMaskDto } from './dto/accounts-metamask.dto';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { User } from 'src/entities/User.entity';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { CurrentUser } from 'src/users/user.decorator';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';

@ApiTags('Accounts')
@Controller('accounts/metamask')
export class AccountsMetamaskController {
  constructor(
    private readonly accountsMetaMaskService: AccountsMetamaskService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  @ApiCreatedResponse({
    description: '在缓存中保存并回传一个校验码，与钱包地址绑定',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  async generateVerificationCodeForMetaMask(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ code }> {
    const code = await this.accountsMetaMaskService.generateMetamaskNonce(
      verifyCode.key,
    );
    return { code };
  }

  @Post('login')
  @ApiCreatedResponse({
    description:
      '通过 MetaMask 验证和 Captcha 验证后，返回登陆的用户信息并在 Cookies 中写入用户 tokens',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsMetaMaskDto: AccountsMetaMaskDto,
  ) {
    const { user, account, tokens } = await this.accountsMetaMaskService.login(
      accountsMetaMaskDto,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('/bind')
  @UseGuards(JWTAuthGuard)
  @ApiCreatedResponse({
    description: '绑定新账号到本用户',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  @ApiUnauthorizedResponse({
    description: '当 Cookies 中的{accessToken}过期或无效时',
  })
  async bind(
    @CurrentUser() user: User,
    @Body() accountsMetaMaskDto: AccountsMetaMaskDto,
  ) {
    return this.accountsMetaMaskService.bindMetaMaskAccount(
      accountsMetaMaskDto,
      user.id,
    );
  }

  @Post('/unbind')
  @UseGuards(JWTAuthGuard)
  @ApiCreatedResponse({
    description: '解绑本用户的现有邮箱账户',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效时',
  })
  @ApiUnauthorizedResponse({
    description: '当 Cookies 中的{accessToken}过期或无效时',
  })
  async unbind(@Body() accountsMetaMaskDto: AccountsMetaMaskDto) {
    return this.accountsMetaMaskService.unbindMetaMaskAccount(
      accountsMetaMaskDto,
    );
  }
}

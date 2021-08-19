import {
  Body,
  Controller,
  Logger,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AccountsWebAuthNDto } from './dto/accounts-webauthn.dto';
import { AccountsWebauthnService } from './accounts-webauthn.service';
import { User } from 'src/entities/User.entity';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { CurrentUser } from 'src/users/user.decorator';
import { Account } from '../../entities/Account.entity';

@ApiTags('Accounts WebAuthN')
@Controller('accounts/webauthn')
export class AccountsWebauthnController {
  private logger = new Logger(AccountsWebauthnController.name);
  constructor(
    private readonly accountsWebauthnService: AccountsWebauthnService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/generate-attestation')
  @ApiOperation({ summary: '给前端生成用于 WebAuthN 注册校验的数据' })
  @ApiCreatedResponse({ description: '返回数据' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  async generateWebauthnAttestationOptions(
    @Body() verifyCodeDto: VerificationCodeDto,
  ) {
    return await this.accountsWebauthnService.generateWebauthnAttestationOptions(
      verifyCodeDto.key,
    );
  }

  @Post('/generate-assertion')
  @ApiOperation({ summary: '给前端生成用于 WebAuthN 登录校验的数据' })
  @ApiCreatedResponse({ description: '返回数据' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  async generateWebauthnAssertionOptions(
    @Body() verifyCodeDto: VerificationCodeDto,
  ) {
    return await this.accountsWebauthnService.generateWebauthnAssertionOptions(
      verifyCodeDto.key,
    );
  }

  @Post('signup/:signature')
  @ApiOperation({ summary: '以 WebAuthN 注册账号，需要邀请码' })
  @ApiCreatedResponse({
    description: '返回登录的用户信息。并在 Cookies 中写入 access_token',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效',
  })
  async signup(
    @Param('signature') signature: string,
    @Res({ passthrough: true }) res: Response,
    @Body() accountsWebauthnDto: AccountsWebAuthNDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsWebauthnService.signup(
      accountsWebauthnDto,
      signature,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('login')
  @ApiOperation({ summary: '以 WebAuthN 登录到现有账号' })
  @ApiCreatedResponse({
    description: '返回登录的用户信息。并在 Cookies 中写入 access_token',
  })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsWebauthnDto: AccountsWebAuthNDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsWebauthnService.login(
      accountsWebauthnDto,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('/bind')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '绑定一个未注册的 WebAuthN 账号到本用户' })
  @ApiCreatedResponse({ description: '绑定并返回账号信息' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async bind(
    @CurrentUser() user: User,
    @Body() accountsWebauthnDto: AccountsWebAuthNDto,
  ): Promise<Account> {
    return this.accountsWebauthnService.bindAccount(
      accountsWebauthnDto,
      user.id,
    );
  }

  @Post('/unbind')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '解绑本用户的现有 WebAuthN 账户' })
  @ApiCreatedResponse({ description: '完成解绑，不返回 data' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async unbind(@Body() accountsWebauthnDto: AccountsWebAuthNDto) {
    return this.accountsWebauthnService.unbindAccount(accountsWebauthnDto);
  }
}

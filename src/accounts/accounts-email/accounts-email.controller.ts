import {
  Res,
  Post,
  Body,
  Param,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { User } from 'src/entities/User.entity';
import { CurrentUser } from 'src/users/user.decorator';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTCookieHelper } from 'src/accounts/jwt-cookie-helper';
import { AccountsService } from '../accounts.service';
import { AccountsEmailService } from './accounts-email.service';
import { VerifyExistsDto } from '../dto/verify-exists.dto';
import { AccountsEmailDto } from './dto/accounts-email.dto';
import { VerificationCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { Account } from '../../entities/Account.entity';

@ApiTags('Accounts')
@Controller('accounts/email')
export class AccountsEmailController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly accountsEmailService: AccountsEmailService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Post('/verification-code')
  @ApiOperation({ summary: '往传入的邮箱地址发送一个验证码，用于登录校验' })
  @ApiCreatedResponse({ description: '发送验证码，不返回 data' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  async generateVerificationCodeForEmail(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<void> {
    await this.accountsEmailService.generateVerificationCodeForEmail(
      verifyCode.key,
    );
  }

  @Post('signup/:signature')
  @ApiOperation({ summary: '以邮箱注册账号，需要邀请码' })
  @ApiCreatedResponse({
    description: '返回登录的用户信息。并在 Cookies 中写入 access_token',
  })
  @ApiBadRequestResponse({
    description: '传入的表单参数不正确或无效',
  })
  async signup(
    @Param('signature') signature: string,
    @Res({ passthrough: true }) res: Response,
    @Body() accountsEmailDto: AccountsEmailDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsService.signup(
      accountsEmailDto,
      signature,
      'email',
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('login')
  @ApiOperation({ summary: '以邮箱登录到现有账号' })
  @ApiCreatedResponse({
    description: '返回登录的用户信息。并在 Cookies 中写入 access_token',
  })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  @ApiUnauthorizedResponse({ description: '用户不存在' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsEmailDto: AccountsEmailDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsService.login(
      accountsEmailDto,
      'email',
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('is-exists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证登录邮箱是否已被注册' })
  @ApiOkResponse({ description: '返回 isExists: true/false' })
  async isExists(
    @Body() verifyExistsDto: VerifyExistsDto,
  ): Promise<{ isExists: boolean }> {
    const isExists: boolean = await this.accountsService.verifyAccountExists(
      verifyExistsDto,
      'email',
    );
    return { isExists };
  }

  @Post('/bind')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '绑定一个未注册的邮箱账号到本用户' })
  @ApiCreatedResponse({ description: '绑定并返回账号信息' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async bind(
    @CurrentUser() user: User,
    @Body() accountsEmailDto: AccountsEmailDto,
  ): Promise<Account> {
    return this.accountsService.bindAccount(accountsEmailDto, user.id, 'email');
  }

  @Post('/unbind')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '解绑本用户的现有邮箱账户' })
  @ApiCreatedResponse({ description: '完成解绑，不返回 data' })
  @ApiBadRequestResponse({ description: '传入的表单参数不正确或无效时' })
  @ApiUnauthorizedResponse({
    description: '当 Cookies 中的 access_token 过期或无效时',
  })
  async unbind(@Body() accountsEmailDto: AccountsEmailDto) {
    return this.accountsService.unbindAccount(accountsEmailDto, 'email');
  }
}

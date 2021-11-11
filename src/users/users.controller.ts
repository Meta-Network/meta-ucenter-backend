import {
  Get,
  Put,
  Post,
  Patch,
  Body,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../utils/user.decorator';
import { UsersService } from './users.service';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTDecodedUser } from '../type';
import { TwoFactorAuthService } from 'src/two-factor-auth/two-factor-auth.service';
import {
  BindTwoFactorDto,
  VerifyTwoFactorDto,
} from './dto/bind-two-factor.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from 'src/entities/User.entity';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { ValidateUsernameDto } from './dto/validate-username.dto';

@ApiCookieAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly tfaService: TwoFactorAuthService,
  ) {}

  @Get('me')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '获取当前用户的用户信息' })
  @ApiOkResponse({ description: '返回当前用户的用户信息' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async getMyInfo(@CurrentUser() user: JWTDecodedUser): Promise<User> {
    return this.usersService.getUserInfo(user.id);
  }

  @Patch('me')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '修改当前用户的用户信息' })
  @ApiOkResponse({ description: '返回修改后的用户信息' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async updateMyInfo(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JWTDecodedUser,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Put('me/username')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: '更新用户的用户名' })
  @ApiOkResponse({ description: '返回修改后的用户信息' })
  @ApiBadRequestResponse({ description: '用户名已存在，或用户已有用户名' })
  @ApiUnauthorizedResponse({
    description: 'Cookies 中的 access_token 过期或无效',
  })
  async setMyUsername(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: UpdateUsernameDto,
  ): Promise<User> {
    return this.usersService.updateUsername(user.id, body.username);
  }

  @Post('username/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证用户的用户名是否可用' })
  @ApiOkResponse({ description: '返回验证结果' })
  async validateUsername(
    @Body() body: ValidateUsernameDto,
  ): Promise<{ isExists: boolean }> {
    return this.usersService.validateUsername(body.username);
  }

  @Post('search')
  @ApiOperation({ summary: '通用用户搜索接口，根据条件搜索全部用户' })
  @ApiOkResponse({ description: '返回符合条件的用户数组' })
  async search(
    @Body() searchUserDto: SearchUserDto,
  ): Promise<{ result: User[]; total: number }> {
    const { options, ...body } = searchUserDto;
    return this.usersService.search(body, options);
  }

  @UseGuards(JWTAuthGuard)
  @Get('me/twoFactor')
  async getMy2FA(@CurrentUser() user: JWTDecodedUser) {
    return await this.tfaService.list2FAOf(user.id);
  }

  @UseGuards(JWTAuthGuard)
  @Post('/twoFactor')
  async bindTwoFactor(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: BindTwoFactorDto,
  ) {
    return await this.tfaService.bind2FA(body.type, { id: user.id });
  }

  @UseGuards(JWTAuthGuard)
  @Post('/twoFactor/verify')
  async verifyTwoFactor(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: VerifyTwoFactorDto,
  ) {
    const isPassed = await this.tfaService.verify(
      body.type,
      user.id,
      body.code,
    );
    return { isPassed };
  }

  @UseGuards(JWTAuthGuard)
  @Post('/twoFactor/enable')
  async enableTwoFactor(
    @CurrentUser() user: JWTDecodedUser,
    @Body() body: VerifyTwoFactorDto,
  ) {
    const isPassed = await this.tfaService.enable2FA(
      body.type,
      user.id,
      body.code,
    );
    return { isPassed };
  }
}

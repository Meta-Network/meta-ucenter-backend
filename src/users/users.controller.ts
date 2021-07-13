import {
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { CurrentUser } from './user.decorator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { JWTDecodedUser } from '../type';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('login/:aud')
  async login(
    @Param('aud') audPlatform: string,
    @Body() loginUserDto: LoginUserDto,
  ) {
    // return this.usersService.login(1, audPlatform);
    return this.usersService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@CurrentUser() user: JWTDecodedUser) {
    return this.usersService.getUserInfo(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyInfo(
    @CurrentUser() user: JWTDecodedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }
}

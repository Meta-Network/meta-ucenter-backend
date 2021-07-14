import { Get, Patch, Body, UseGuards, Controller } from '@nestjs/common';
import { CurrentUser } from './user.decorator';
import { UsersService } from './users.service';
import { JWTAuthGuard } from 'src/auth/jwt.guard';
import { JWTDecodedUser } from '../type';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JWTAuthGuard)
  @Get('me')
  async getMyInfo(@CurrentUser() user: JWTDecodedUser) {
    return this.usersService.getUserInfo(user.id);
  }

  @UseGuards(JWTAuthGuard)
  @Patch('me')
  async updateMyInfo(
    @CurrentUser() user: JWTDecodedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }
}

import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('login/')
  async login() {
    return this.userService.login(1);
  }

  @UseGuards(JwtAuthGuard)
  @Get('test')
  getProfile(@Request() req: any) {
    return {
      userDataFromJWT: req.user,
      message: 'You passed the JWT Auth Guard',
    };
  }
}

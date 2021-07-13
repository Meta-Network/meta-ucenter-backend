import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('login/:aud')
  async login(@Param('aud') audPlatform: string) {
    return this.userService.login(1, audPlatform);
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

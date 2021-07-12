import { Controller, Get, Param } from '@nestjs/common';
import { UserinfoService } from './userinfo.service';

@Controller('userinfo')
export class UserinfoController {
  constructor(private readonly userinfoService: UserinfoService) {}

  @Get()
  getUser(): string {
    return this.userinfoService.getUserinfo();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return `current uid: ${uid}`;
  }
}

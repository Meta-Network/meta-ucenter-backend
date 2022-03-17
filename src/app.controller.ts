import { ApiCookieAuth } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

@ApiCookieAuth()
@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello world!';
  }
}

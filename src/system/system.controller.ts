import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private service: SystemService) {}
  @Get('jwtPublicKey')
  getJwtSigningPublicKey() {
    return this.service.getPublicKeyForAccessToken();
  }
}

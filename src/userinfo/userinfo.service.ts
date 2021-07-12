import { Injectable } from '@nestjs/common';

@Injectable()
export class UserinfoService {
  getUserinfo(): string {
    return 'info_a1';
  }
}

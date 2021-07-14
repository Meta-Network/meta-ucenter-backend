import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../entities/User.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async refresh(uid: number, aud: string | string[]) {
    const user: User = await this.usersService.findOne(uid);
    return this.authService.signJWT(user, aud);
  }
}

import { Injectable } from '@nestjs/common';
import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly accountsService: AccountsService,
  ) {}

  async refresh(uid: number, accountId: number, aud: string | string[]) {
    const user: User = await this.usersService.findOne(uid);
    const account: Account = await this.accountsService.findOne(accountId);
    return this.authService.signJWT(user, account, aud);
  }
}

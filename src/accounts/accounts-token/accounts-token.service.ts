import { Injectable } from '@nestjs/common';
import { Account } from 'src/entities/Account.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/User.entity';
import { AuthService } from 'src/auth/auth.service';
import { AccountsService } from '../accounts.service';

@Injectable()
export class AccountsTokenService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
  ) {}

  async refresh(uid: number, accountId: number) {
    const user: User = await this.usersService.findOne(uid);
    const account: Account = await this.accountsService.findOne(accountId);
    return { user, tokens: await this.authService.signLoginJWT(user, account) };
  }
}

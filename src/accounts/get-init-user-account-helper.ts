import { Injectable } from '@nestjs/common';
import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';
import { UsersService } from '../users/users.service';
import { AccountsService } from './accounts.service';

@Injectable()
export class UserAccountHelper {
  constructor(
    private usersService: UsersService,
    private accountsService: AccountsService,
  ) {}

  async get(userAccountData: {
    account_id: string;
    platform: string;
  }): Promise<{ user: User; userAccount: Account }> {
    const userAccount: Account = await this.accountsService.findOne(
      userAccountData,
    );

    const user = userAccount
      ? await this.usersService.findOne(userAccount.user_id)
      : null;

    return { user, userAccount };
  }

  async init(userAccountData: {
    account_id: string;
    platform: string;
  }): Promise<{ user: User; userAccount: Account }> {
    const user = await this.usersService.save();
    const userAccount = await this.accountsService.save({
      ...userAccountData,
      user_id: user.id,
    });

    return { user, userAccount };
  }
}

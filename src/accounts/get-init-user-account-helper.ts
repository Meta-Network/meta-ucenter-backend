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
  async getOrInit(userAccountData: {
    account_id: string;
    platform: string;
  }): Promise<{ user: User; userAccount: Account }> {
    let userAccount: Account = await this.accountsService.findOne(
      userAccountData,
    );
    let user: User;

    if (!userAccount) {
      user = await this.usersService.save();
      userAccount = await this.accountsService.save({
        ...userAccountData,
        user_id: user.id,
      });
    } else {
      user = await this.usersService.findOne(userAccount.user_id);
    }

    return { user, userAccount };
  }
}

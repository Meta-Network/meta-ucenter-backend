import { Account } from 'src/entities/Account.entity';
import { AccountsService } from './accounts.service';
import { AccountsVerifier } from './accounts.verifier';
import { VerifyExistsDto } from './dto/verify-exists.dto';
import { Platforms } from './type';

export class AccountsManager {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly platform: Platforms,
    private readonly verify: AccountsVerifier,
  ) {}

  async signup(accountDto: any) {
    return await this.accountsService.signup(
      accountDto,
      this.platform,
      this.verify,
    );
  }

  async login(accountDto: any) {
    return await this.accountsService.login(
      accountDto,
      this.platform,
      this.verify,
    );
  }

  async unbindAccount(accountDto: any): Promise<void> {
    return await this.accountsService.unbindAccount(
      accountDto,
      this.platform,
      this.verify,
    );
  }

  async bindAccount(accountDto: any, userId: number): Promise<Account> {
    return await this.accountsService.bindAccount(
      accountDto,
      userId,
      this.platform,
      this.verify,
    );
  }

  async verifyAccountExists(
    verifyExistsDto: VerifyExistsDto,
  ): Promise<boolean> {
    return await this.accountsService.verifyAccountExists(
      verifyExistsDto,
      this.platform,
    );
  }
}

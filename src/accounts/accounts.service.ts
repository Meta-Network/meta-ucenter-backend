import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Platforms, JWTTokens } from './type';
import { User } from 'src/entities/User.entity';
import { Account } from 'src/entities/Account.entity';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { InvitationService } from 'src/invitation/invitation.service';
import { VerifyExistsDto } from './dto/verify-exists.dto';
import { AccountsVerifer } from './accounts.verifier';
import Events from '../events';

@Injectable()
export class AccountsService {
  private logger = new Logger(AccountsService.name);
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly invitationService: InvitationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async find(searchParams: any) {
    return await this.accountsRepository.find(searchParams);
  }
  async findOne(searchParams: any, options = {}): Promise<Account> {
    return await this.accountsRepository.findOne(searchParams, options);
  }
  async save(saveParams: any): Promise<Account> {
    return await this.accountsRepository.save(saveParams);
  }
  async delete(accountId: number) {
    return await this.accountsRepository.delete(accountId);
  }

  async getUser(userAccountData: {
    account_id: string;
    platform: string;
  }): Promise<{ user: User; userAccount: Account }> {
    const userAccount: Account = await this.findOne(userAccountData);

    const user = userAccount
      ? await this.usersService.findOne(userAccount.user_id)
      : null;

    return { user, userAccount };
  }

  async initUser(userAccountData: {
    account_id: string;
    platform: string;
  }): Promise<{ user: User; userAccount: Account }> {
    const user = await this.usersService.save();
    const userAccount = await this.save({
      ...userAccountData,
      user_id: user.id,
    });

    this.eventEmitter.emit(Events.UserCreated, user);
    return { user, userAccount };
  }

  async bindAccount(
    accountDto: any,
    userId: number,
    platform: Platforms,
    verify: AccountsVerifer,
  ): Promise<Account> {
    await verify(accountDto);

    const userAccountDto = { account_id: accountDto.account, platform };
    const hasBoundAlready = await this.findOne(userAccountDto);

    if (hasBoundAlready) {
      throw new BadRequestException(
        `This ${platform} account has bound to a user already.`,
      );
    }

    const userHasAccountDto = { user_id: userId, platform };
    const hasAccountAlready = await this.findOne(userHasAccountDto);

    if (hasAccountAlready) {
      throw new BadRequestException(`You have an ${platform} account already.`);
    }

    return await this.save({ ...userAccountDto, user_id: userId });
  }

  async signup(
    accountDto: any,
    signature: string,
    platform: Platforms,
    verify: AccountsVerifer,
  ) {
    await verify(accountDto);

    const invitation = await this.invitationService.findOne({ signature });
    if (!invitation) {
      throw new BadRequestException('Invitation does not exist.');
    }

    if (invitation.invitee_user_id) {
      throw new BadRequestException('Invitation is already used.');
    }

    const userAccountData = {
      account_id: accountDto.account,
      platform,
    };

    const hasAlreadySigned: { user; userAccount } = await this.getUser(
      userAccountData,
    );

    if (hasAlreadySigned.user) {
      throw new BadRequestException('User is signed already, please login.');
    }

    const { user, userAccount } = await this.initUser(userAccountData);

    invitation.invitee_user_id = user.id;
    await this.invitationService.update(invitation);

    const tokens: JWTTokens = await this.authService.signLoginJWT(
      user,
      userAccount,
    );
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async login(accountDto: any, platform: Platforms, verify: AccountsVerifer) {
    await verify(accountDto);

    const userAccountData = {
      account_id: accountDto.account,
      platform,
    };

    const { user, userAccount } = await this.getUser(userAccountData);

    if (!user || !userAccount) {
      throw new UnauthorizedException('User account does not exist.');
    }

    const tokens: JWTTokens = await this.authService.signLoginJWT(
      user,
      userAccount,
    );
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async unbindAccount(
    accountDto: any,
    platform: Platforms,
    verify: AccountsVerifer,
  ): Promise<void> {
    await verify(accountDto);

    const userAccountData = {
      account_id: accountDto.account,
      platform,
    };

    const account = await this.findOne(userAccountData);
    if (!account) {
      throw new BadRequestException('This account does not exist.');
    }

    const accounts = await this.find({ user_id: account.user_id });
    if (accounts.length < 2) {
      throw new BadRequestException(
        'The user has only this one account, which cannot be unbound.',
      );
    }
    await this.delete(account.id);
  }

  async verifyAccountExists(
    verifyExistsDto: VerifyExistsDto,
    platform: Platforms,
  ): Promise<boolean> {
    const userAccountData = { account_id: verifyExistsDto.account, platform };

    const hasAlreadySigned: { user; userAccount } = await this.getUser(
      userAccountData,
    );

    return Boolean(hasAlreadySigned.user);
  }
}

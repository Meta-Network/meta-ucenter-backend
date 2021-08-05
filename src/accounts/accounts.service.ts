import {
  Inject,
  Injectable,
  forwardRef,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platforms } from './type';
import { User } from 'src/entities/User.entity';
import { Account } from 'src/entities/Account.entity';
import { JWTTokens } from 'src/type/jwt-login-result';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { InvitationService } from 'src/invitation/invitation.service';
import { VerifyExistsDto } from './dto/verify-exists.dto';
import { AccountsEmailService } from './accounts-email/accounts-email.service';
import { AccountsMetamaskService } from './accounts-metamask/accounts-metamask.service';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly invitationService: InvitationService,
    @Inject(forwardRef(() => AccountsEmailService))
    private readonly accountsEmailService: AccountsEmailService,
    @Inject(forwardRef(() => AccountsMetamaskService))
    private readonly accountsMetamaskService: AccountsMetamaskService,
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

  private getVerify(platform: string) {
    const service = this[`accounts${capitalize(platform)}Service`];
    const verify = service.verify.bind(service);

    if (verify) {
      return verify;
    } else {
      throw new Error(`No verify defined for the platform: "${platform}"`);
    }
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

    return { user, userAccount };
  }

  async bindAccount(
    accountDto: any,
    userId: number,
    platform: Platforms,
  ): Promise<Account> {
    const verify = this.getVerify(platform);
    await verify(accountDto);

    const userAccountDto = { account_id: accountDto.account, platform };
    const hasBoundAlready = await this.findOne(userAccountDto);

    if (hasBoundAlready) {
      throw new BadRequestException(
        `This ${platform} account has bound to a user already .`,
      );
    }

    const userHasAccountDto = { user_id: userId, platform };
    const hasAccountAlready = await this.findOne(userHasAccountDto);

    if (hasAccountAlready) {
      throw new BadRequestException(`You have an ${platform} Account already.`);
    }

    return await this.save({ ...userAccountDto, user_id: userId });
  }

  async signup(accountDto: any, signature: string, platform: Platforms) {
    const verify = this.getVerify(platform);
    await verify(accountDto);

    const invitation = await this.invitationService.findOne(signature);
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

    const tokens: JWTTokens = await this.authService.signJWT(user, userAccount);
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async login(accountDto: any, platform: Platforms) {
    const verify = this.getVerify(platform);
    await verify(accountDto);

    const userAccountData = {
      account_id: accountDto.account,
      platform,
    };

    const { user, userAccount } = await this.getUser(userAccountData);

    if (!user || !userAccount) {
      throw new UnauthorizedException('User account does not exist');
    }

    const tokens: JWTTokens = await this.authService.signJWT(user, userAccount);
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async unbindAccount(accountDto: any, platform: Platforms): Promise<void> {
    const verify = this.getVerify(platform);
    await verify(accountDto);

    const userAccountData = {
      account_id: accountDto.account,
      platform,
    };

    const user = await this.findOne(userAccountData);
    const accounts = await this.find({ user_id: user.user_id });

    if (accounts.length < 2) {
      throw new BadRequestException(
        'The user has only this one account, which cannot be unbound.',
      );
    }

    const account = await this.findOne(userAccountData);
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

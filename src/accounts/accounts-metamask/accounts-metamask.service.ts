import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from 'src/entities/Account.entity';
import { AuthService } from 'src/auth/auth.service';
import { JWTTokens } from 'src/type/jwt-login-result';
import { UsersService } from 'src/users/users.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { AccountsService } from '../accounts.service';
import { AccountsMetaMaskDto } from './dto/accounts-metamask.dto';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { UserAccountHelper } from '../get-init-user-account-helper';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

@Injectable()
export class AccountsMetamaskService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly userAccountHelper: UserAccountHelper,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateMetamaskNonce(address: string): Promise<string> {
    return await this.verificationCodeService.generateVcode(
      'metamask-login',
      address,
    );
  }

  async login(accountsMetaMaskDto: AccountsMetaMaskDto, aud = 'ucenter') {
    await this.verifySignature(accountsMetaMaskDto);

    const userAccountData = {
      account_id: accountsMetaMaskDto.address,
      platform: 'MetaMask',
    };

    const { user, userAccount } = await this.userAccountHelper.getOrInit(
      userAccountData,
    );

    const tokens: JWTTokens = await this.authService.signJWT(
      user,
      userAccount,
      aud,
    );
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async bindMetaMaskAccount(
    accountsMetaMaskDto: AccountsMetaMaskDto,
    userId: number,
  ): Promise<Account> {
    await this.verifySignature(accountsMetaMaskDto);

    const userAccountData = {
      account_id: accountsMetaMaskDto.address,
      platform: 'MetaMask',
    };
    const hasAlreadyBound = await this.accountsService.findOne(userAccountData);

    if (hasAlreadyBound) {
      throw new BadRequestException(
        'This MetaMask account has already bound to this user.',
      );
    }
    return await this.accountsService.save({
      ...userAccountData,
      user_id: userId,
    });
  }

  async unbindMetaMaskAccount(
    accountsMetaMaskDto: AccountsMetaMaskDto,
  ): Promise<void> {
    await this.verifySignature(accountsMetaMaskDto);

    const userAccountData = {
      account_id: accountsMetaMaskDto.address,
      platform: 'MetaMask',
    };

    const user = await this.accountsService.findOne(userAccountData);
    const accounts = await this.accountsService.find({ user_id: user.user_id });

    if (accounts.length < 2) {
      throw new BadRequestException(
        'The user has only this one account, which cannot be unbound.',
      );
    }

    const account = await this.accountsService.findOne(userAccountData);
    await this.accountsService.delete(account.id);
  }

  async verifySignature(
    accountsMetaMaskDto: AccountsMetaMaskDto,
  ): Promise<void> {
    const nonce = await this.verificationCodeService.getVcode(
      'metamask-login',
      accountsMetaMaskDto.address,
    );

    if (nonce === null) {
      throw new BadRequestException(
        'Failed to get verification code from database.',
      );
    }

    const message = `\x19Ethereum Signed Message:\n${nonce.length}${nonce}`;

    // We now are in possession of msg, publicAddress and signature. We
    // will use a helper from eth-sig-util to extract the address from the signature
    const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: accountsMetaMaskDto.signature,
    });

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    const isSignatureVerified =
      address.toLowerCase() === accountsMetaMaskDto.address.toLowerCase();

    if (!isSignatureVerified) {
      throw new BadRequestException('MetaMask authentication is not verified.');
    }

    const isCaptchaVerified = await this.captchaService.verify(
      accountsMetaMaskDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }
  }
}

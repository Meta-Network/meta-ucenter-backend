import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AccountsWebAuthNDto } from './dto/accounts-webauthn.dto';
import { WebAuthN } from '../../entities/WebAuthN.entity';
import { AccountsService } from '../accounts.service';
import base64url from 'base64url';
import {
  verifyAttestationResponse,
  verifyAssertionResponse,
  generateAttestationOptions,
  generateAssertionOptions,
} from '@simplewebauthn/server';
import * as randomstring from 'randomstring';
import { Account } from '../../entities/Account.entity';

@Injectable()
export class AccountsWebauthnService {
  private logger = new Logger(AccountsWebauthnService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly accountsService: AccountsService,
    private readonly verificationCodeService: VerificationCodeService,
    @InjectRepository(WebAuthN)
    private readonly webauthnRepository: Repository<WebAuthN>,
  ) {}

  async generateWebauthnChallenge(username: string) {
    return {
      challenge: await this.verificationCodeService.generateVcode(
        'webauthn-login',
        username,
        { length: 32, charset: 'alphanumeric' },
      ),
    };
  }

  async generateWebauthnAttestationOptions(username: string) {
    return generateAttestationOptions({
      challenge: (await this.generateWebauthnChallenge(username)).challenge,
      rpID: this.configService.get<string>('webauthn.rp.id'),
      rpName: this.configService.get<string>('webauthn.rp.name'),
      userID: randomstring.generate(16),
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        requireResidentKey: false,
        residentKey: 'discouraged',
        userVerification: 'discouraged',
        authenticatorAttachment: 'platform',
      },
    });
  }

  async generateWebauthnAssertionOptions(username: string) {
    const userAuthenticators = await this.webauthnRepository.find({
      where: { username },
    });
    return generateAssertionOptions({
      // Require users to use a previously-registered authenticator
      challenge: (await this.generateWebauthnChallenge(username)).challenge,
      rpID: this.configService.get<string>('webauthn.rp.id'),
      userVerification: 'discouraged',
      allowCredentials: userAuthenticators.map((authenticator) => ({
        id: base64url.toBuffer(authenticator.credential_id),
        type: 'public-key',
        // Optional
        transports: ['internal'],
      })),
    });
  }

  private async verifyForSignup(
    accountsWebAuthNDto: AccountsWebAuthNDto,
  ): Promise<any> {
    const { account, credential } = accountsWebAuthNDto;

    const challenge = await this.verificationCodeService.getVcode(
      'webauthn-login',
      account,
    );
    let verification;
    try {
      verification = await verifyAttestationResponse({
        credential,
        expectedChallenge: base64url.encode(
          Buffer.from(Uint8Array.from(challenge, (c) => c.charCodeAt(0))),
        ),
        expectedRPID: this.configService.get<string>('webauthn.rp.id'),
        expectedOrigin: this.configService.get<string>('webauthn.rp.origin'),
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
    const { verified, attestationInfo } = verification;

    if (!verified) {
      throw new BadRequestException('Web Authentication failed.');
    }

    const { credentialPublicKey, credentialID } = attestationInfo;
    return {
      credentialID: base64url.encode(credentialID),
      credentialPublicKey: base64url.encode(credentialPublicKey),
    };
  }

  async verifyForLogin(accountsWebAuthNDto: AccountsWebAuthNDto) {
    const { credential } = accountsWebAuthNDto;

    const challenge = await this.verificationCodeService.getVcode(
      'webauthn-login',
      accountsWebAuthNDto.account,
    );

    const account = await this.webauthnRepository.findOne({
      where: { username: accountsWebAuthNDto.account },
    });

    let verification;
    try {
      verification = verifyAssertionResponse({
        credential,
        expectedChallenge: base64url.encode(
          Buffer.from(Uint8Array.from(challenge, (c) => c.charCodeAt(0))),
        ),
        authenticator: {
          // TODO: should verify this counter is larger than last request:
          counter: 0,
          credentialID: base64url.toBuffer(account.credential_id),
          credentialPublicKey: base64url.toBuffer(account.public_key),
        },
        expectedRPID: this.configService.get<string>('webauthn.rp.id'),
        expectedOrigin: this.configService.get<string>('webauthn.rp.origin'),
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
    const { verified, assertionInfo } = verification;

    if (!verified) {
      throw new BadRequestException('Login Web Authentication failed.');
    }

    const { credentialID } = assertionInfo;
    return {
      credentialID: base64url.encode(credentialID),
    };
  }

  async signup(accountsWebAuthNDto: AccountsWebAuthNDto, signature) {
    const { credentialID, credentialPublicKey } = await this.verifyForSignup(
      accountsWebAuthNDto,
    );

    const signupResult = await this.accountsService.signup(
      accountsWebAuthNDto,
      signature,
      'webauthn',
      // empty verify since we use it above to save the return result
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async () => {},
    );

    await this.webauthnRepository.save({
      username: accountsWebAuthNDto.account,
      credential_id: credentialID,
      public_key: credentialPublicKey,
    });

    return signupResult;
  }

  async login(accountsWebAuthNDto: AccountsWebAuthNDto) {
    await this.verifyForLogin(accountsWebAuthNDto);
    return this.accountsService.login(
      accountsWebAuthNDto,
      'webauthn',
      // empty verify since we use it above to save the return result
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async () => {},
    );
  }

  async bindAccount(
    accountDto: AccountsWebAuthNDto,
    userId: number,
  ): Promise<Account> {
    const { credentialID, credentialPublicKey } = await this.verifyForSignup(
      accountDto,
    );

    const userAccountDto: Partial<Account> = {
      account_id: accountDto.account,
      platform: 'webauthn',
    };
    const hasBoundAlready = await this.accountsService.findOne(userAccountDto);
    if (hasBoundAlready) {
      throw new BadRequestException(
        `This webauthn account has bound to a user already.`,
      );
    }

    const userHasAccountDto = { user_id: userId, platform: 'webauthn' };
    const hasAccountAlready = await this.accountsService.findOne(
      userHasAccountDto,
    );

    // if user has a webauthn account, then save the webauthn credentials only.
    // otherwise, we need to create an account for this user
    let account: Account = hasAccountAlready;
    if (!hasAccountAlready) {
      account = await this.accountsService.save({
        ...userAccountDto,
        user_id: userId,
      });
    }

    await this.webauthnRepository.save({
      username: accountDto.account,
      credential_id: credentialID,
      public_key: credentialPublicKey,
    });

    return account;
  }

  async unbindAccount(accountDto: AccountsWebAuthNDto): Promise<void> {
    const { credentialID } = await this.verifyForLogin(accountDto);

    const userAccountData = {
      account_id: accountDto.account,
      platform: 'webauthn',
    };

    const thisAccount = await this.accountsService.findOne(userAccountData);
    if (!thisAccount) {
      throw new BadRequestException('This account does not exist.');
    }

    const webauths = await this.webauthnRepository.find({
      username: thisAccount.account_id,
    });

    // if this user has only one webauthn id, then unbind(delete) this account.
    // otherwise, we keep this account but remove the credentialID only.
    if (webauths.length === 1) {
      const accounts = await this.accountsService.find({
        user_id: thisAccount.user_id,
      });
      if (accounts.length < 2) {
        throw new BadRequestException(
          'The user has only this one account, which cannot be unbound.',
        );
      }
      await this.accountsService.delete(thisAccount.id);
    } else {
      await this.webauthnRepository.delete({
        credential_id: credentialID,
      });
    }
  }
}

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
      // TODO: change next line
      userID: 'user_id_here',
      userName: username,
      attestationType: 'indirect',
      authenticatorSelection: {
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
      userVerification: 'preferred',
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
    const verification = await verifyAttestationResponse({
      credential,
      expectedChallenge: base64url.encode(
        Buffer.from(Uint8Array.from(challenge, (c) => c.charCodeAt(0))),
      ),
      expectedRPID: this.configService.get<string>('webauthn.rp.id'),
      expectedOrigin: this.configService.get<string>('webauthn.rp.origin'),
    });
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

    const verification = verifyAssertionResponse({
      credential,
      expectedChallenge: base64url.encode(
        Buffer.from(Uint8Array.from(challenge, (c) => c.charCodeAt(0))),
      ),
      authenticator: {
        counter: 0,
        credentialID: base64url.toBuffer(account.credential_id),
        credentialPublicKey: base64url.toBuffer(account.public_key),
      },
      expectedRPID: this.configService.get<string>('webauthn.rp.id'),
      expectedOrigin: this.configService.get<string>('webauthn.rp.origin'),
    });

    const { verified } = verification;

    if (!verified) {
      throw new BadRequestException('Login Web Authentication failed.');
    }
  }

  async login(accountsWebAuthNDto: AccountsWebAuthNDto) {
    return this.accountsService.login(
      accountsWebAuthNDto,
      'webauthn',
      // empty verify since we use it above to save the return result
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async (accountsWebAuthNDto: AccountsWebAuthNDto) =>
        await this.verifyForLogin(accountsWebAuthNDto),
    );
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
}

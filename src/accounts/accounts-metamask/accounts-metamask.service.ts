import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaptchaService } from 'src/captcha/captcha.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AccountsMetaMaskDto } from './dto/accounts-metamask.dto';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

@Injectable()
export class AccountsMetamaskService {
  constructor(
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateMetamaskNonce(address: string): Promise<string> {
    return await this.verificationCodeService.generateVcode(
      'metamask-login',
      address,
    );
  }

  async verify(accountsMetaMaskDto: AccountsMetaMaskDto): Promise<void> {
    const nonce = await this.verificationCodeService.getVcode(
      'metamask-login',
      accountsMetaMaskDto.account,
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
      address.toLowerCase() === accountsMetaMaskDto.account.toLowerCase();

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

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { TwoFactorType } from 'src/type/TwoFactor';
import { User } from 'src/entities/User.entity';
import { TotpStrategy } from './totp.strategy';
import { Repository } from 'typeorm';
import { TwoFactorAuth } from 'src/entities/TwoFactorAuth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { EmailStrategy } from './email.strategy';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    @InjectRepository(TwoFactorAuth)
    private readonly tfaRepo: Repository<TwoFactorAuth>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailStrategy: EmailStrategy,
  ) {}

  async get2FADetailFor(userId: number, type: TwoFactorType) {
    const target = await this.tfaRepo.findOne(
      { user: { id: userId }, type },
      { relations: ['user'] },
    );
    return target;
  }

  async isTypeExistFor(userId: number, type: TwoFactorType): Promise<boolean> {
    const target = await this.get2FADetailFor(userId, type);
    return Boolean(target);
  }

  async requestChallenge(userId: number, type: TwoFactorType) {
    const isTypeExist = await this.isTypeExistFor(userId, type);

    const user = await this.userRepo.findOne(userId);

    const NoNeedTypes = [TwoFactorType.TOTP];

    if (NoNeedTypes.includes(type)) {
      throw new BadRequestException(
        `No Challenge for Type ${type}, just verify.`,
      );
    }

    if (type !== TwoFactorType.EmailCode && !isTypeExist)
      throw new BadRequestException('Type not exist');

    switch (type) {
      case TwoFactorType.EmailCode: {
        await this.emailStrategy.generateVerificationCodeForEmail(
          user.username,
        );
        break;
      }
      default:
        throw new NotImplementedException(
          `2FA Challenge for type ${type} was not implemented`,
        );
    }
  }

  async bind2FA(type: TwoFactorType, _user: Partial<User>) {
    const current2FAForThisType = await this.get2FADetailFor(_user.id, type);
    if (Boolean(current2FAForThisType) && current2FAForThisType.isEnabled)
      throw new ConflictException('This 2FA Method is enabled already.');

    const user = await this.userRepo.findOne(_user.id);

    switch (type) {
      // Email
      case TwoFactorType.EmailCode: {
        throw new BadRequestException('Please bind your email in the settings');
      }
      case TwoFactorType.TOTP: {
        const { secret, otpauth } = await TotpStrategy.generate(user.username);
        // replace the old one by rm
        if (current2FAForThisType)
          await this.tfaRepo.remove(current2FAForThisType);

        await this.tfaRepo.save({
          secret,
          type,
          user,
        });
        return { otpauth, secret };
      }
      default:
        throw new NotImplementedException(
          `2FA type ${type} was not implemented`,
        );
    }
  }

  async _list2FAOf(userId: number) {
    const twoFactors = await this.tfaRepo.find({ user: { id: userId } });
    return twoFactors;
  }

  async list2FAOf(userId: number) {
    const twoFactors = await this._list2FAOf(userId);
    return twoFactors.map((tfa) => {
      const returnedTfaDetail = Object.assign({}, tfa);
      if (tfa.type === TwoFactorType.TOTP && tfa.isEnabled) {
        // hide enabled TOTP's secret of safety
        returnedTfaDetail.secret = '_REDACTED_FOR_ENABLED_2FA_';
      }
      return returnedTfaDetail;
    });
  }

  async verify(
    type: TwoFactorType,
    userId: number,
    code: string,
  ): Promise<boolean> {
    if (type === TwoFactorType.EmailCode) {
      const user = await this.userRepo.findOne(userId);
      return this._verify(
        {
          type: TwoFactorType.EmailCode,
          user,
        },
        code,
      );
    }

    const detail = await this.get2FADetailFor(userId, type);
    if (!detail) throw new NotFoundException(`No found for type: '${type}'`);
    if (!detail.isEnabled)
      throw new BadRequestException('Please activate before using');

    // @todo: add check in this API, throw Error here just in case.
    return this._verify(detail, code);
  }

  async _verify(
    detail: Partial<TwoFactorAuth>,
    code: string,
  ): Promise<boolean> {
    const getDetailWithSecret = () => {
      return this.tfaRepo.findOne(detail.id, {
        select: ['secret'],
      });
    };
    switch (detail.type) {
      case TwoFactorType.EmailCode: {
        const email = detail.user.username;
        return this.emailStrategy.verify(email, code);
      }
      case TwoFactorType.TOTP: {
        const { secret } = await getDetailWithSecret();
        console.info('secret', secret)
        return TotpStrategy.validate(code, secret);
      }
    }
  }

  async enable2FA(
    type: TwoFactorType,
    userId: number,
    code: string,
  ): Promise<boolean> {
    const detail = await this.get2FADetailFor(userId, type);
    if (!detail) throw new NotFoundException(`No found for type: '${type}'`);
    const isOTPValid = await this._verify(detail, code);

    if (!isOTPValid)
      throw new BadRequestException(
        'Failed, please check the code and try again',
      );

    // passed the check
    detail.isEnabled = true;
    // save into the DB
    await this.tfaRepo.save(detail);
    return true;
  }

  static getPriorityFromType(type: TwoFactorType) {
    if (type === TwoFactorType.TOTP) return 3;
    else return 1;
  }
}

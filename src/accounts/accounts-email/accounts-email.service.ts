import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from 'src/entities/Account.entity';
import { AuthService } from 'src/auth/auth.service';
import { JWTTokens } from 'src/type/jwt-login-result';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AccountsService } from '../accounts.service';
import { AccountsEmailDto } from './dto/accounts-email.dto';
import { UserAccountHelper } from '../get-init-user-account-helper';
import { InvitationService } from 'src/invitation/invitation.service';
import { VerifyExistsDto } from './dto/verify-exists.dto';

@Injectable()
export class AccountsEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly invitationService: InvitationService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly userAccountHelper: UserAccountHelper,
    private readonly verificationCodeService: VerificationCodeService,
  ) {}

  async generateVerificationCodeForEmail(email: string): Promise<string> {
    const code = await this.verificationCodeService.generateVcode(
      'email-login',
      email,
    );
    //  用邮件服务发送生成的验证码
    await this.sendVerificationCodeEmail(email, code);
    return code;
  }

  private async sendVerificationCodeEmail(email: string, code: string) {
    const [from, fromName, templateInvokeName] = [
      'email.from',
      'email.from_name',
      'email.template_invoke_name_vcode',
    ].map((key) => this.configService.get<string>(key));

    await this.emailService.send(
      {
        from,
        fromName,
        to: email,
        templateInvokeName,
      },
      { code },
    );
  }

  async signup(accountsEmailDto: AccountsEmailDto, signature) {
    await this.verifyEmail(accountsEmailDto);

    const invitation = await this.invitationService.findOne(signature);
    if (!invitation) {
      throw new BadRequestException('Invitation does not exist.');
    }

    if (invitation.invitee_user_id) {
      throw new BadRequestException('Invitation is already used.');
    }

    const userAccountData = {
      account_id: accountsEmailDto.email,
      platform: 'email',
    };

    const hasAlreadySigned: { user; userAccount } =
      await this.userAccountHelper.get(userAccountData);

    if (hasAlreadySigned.user) {
      throw new BadRequestException('User is signed already, please login.');
    }

    const { user, userAccount } = await this.userAccountHelper.init(
      userAccountData,
    );

    invitation.invitee_user_id = user.id;
    await this.invitationService.update(invitation);

    const tokens: JWTTokens = await this.authService.signJWT(user, userAccount);
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async login(accountsEmailDto: AccountsEmailDto) {
    await this.verifyEmail(accountsEmailDto);

    const userAccountData = {
      account_id: accountsEmailDto.email,
      platform: 'email',
    };

    const { user, userAccount } = await this.userAccountHelper.get(
      userAccountData,
    );

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

  async bindEmailAccount(
    accountsEmailDto: AccountsEmailDto,
    userId: number,
  ): Promise<Account> {
    await this.verifyEmail(accountsEmailDto);

    const userAccountData = {
      account_id: accountsEmailDto.email,
      platform: 'email',
    };
    const hasAlreadyBound = await this.accountsService.findOne(userAccountData);

    if (hasAlreadyBound) {
      throw new BadRequestException(
        'This Email has already bound to this user.',
      );
    }
    return await this.accountsService.save({
      ...userAccountData,
      user_id: userId,
    });
  }

  async unbindEmailAccount(accountsEmailDto: AccountsEmailDto): Promise<void> {
    await this.verifyEmail(accountsEmailDto);

    const userAccountData = {
      account_id: accountsEmailDto.email,
      platform: 'email',
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

  async verifyEmail(accountsEmailDto: AccountsEmailDto): Promise<void> {
    const isEmailVerified = await this.verificationCodeService.verify(
      'email-login',
      accountsEmailDto.email,
      accountsEmailDto.verifyCode,
    );
    if (!isEmailVerified) {
      throw new BadRequestException('Email authentication is not verified.');
    }

    const isCaptchaVerified = await this.captchaService.verify(
      accountsEmailDto.hcaptchaToken,
    );
    if (!isCaptchaVerified) {
      throw new BadRequestException('Captcha authentication is not verified.');
    }
  }

  async verifyAccountExists(
    verifyExistsDto: VerifyExistsDto,
  ): Promise<boolean> {
    const userAccountData = {
      account_id: verifyExistsDto.email,
      platform: 'email',
    };

    const hasAlreadySigned: { user; userAccount } =
      await this.userAccountHelper.get(userAccountData);

    return Boolean(hasAlreadySigned.user);
  }
}

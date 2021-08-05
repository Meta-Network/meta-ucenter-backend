import { forwardRef, Module } from '@nestjs/common';
import { Account } from '../entities/Account.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { JWTCookieHelper } from './jwt-cookie-helper';
import { InvitationModule } from '../invitation/invitation.module';
import { AccountsEmailModule } from './accounts-email/accounts-email.module';
import { AccountsMetamaskModule } from './accounts-metamask/accounts-metamask.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    InvitationModule,
    TypeOrmModule.forFeature([Account]),
    forwardRef(() => AccountsEmailModule),
    forwardRef(() => AccountsMetamaskModule),
  ],
  providers: [AccountsService, JWTCookieHelper],
  exports: [AccountsService, JWTCookieHelper],
})
export class AccountsModule {}

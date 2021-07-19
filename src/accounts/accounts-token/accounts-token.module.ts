import { Module } from '@nestjs/common';
import { AccountsTokenService } from './accounts-token.service';
import { AccountsTokenController } from './accounts-token.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { AccountsModule } from '../accounts.module';

@Module({
  imports: [AuthModule, UsersModule, AccountsModule],
  controllers: [AccountsTokenController],
  providers: [AccountsTokenService],
})
export class AccountsTokenModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/User.entity';
import { UsersModule } from './users/users.module';
import { LoginModule } from './login/login.module';
// import { SystemModule } from './system/system.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { LoginSmsModule } from './login/login-sms/login-sms.module';
import { LoginEmailModule } from './login/login-email/login-email.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { EmailModule } from './email/email.module';
import { VcodeCacheModule } from './vcode-cache/vcode-cache.module';
import { AccountsModule } from './accounts/accounts.module';
import * as fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      ssl: {
        ca: fs.readFileSync('./rds-ca-2019-root.pem', 'utf8').toString(),
      },
      port: 3306,
      connectTimeout: 60 * 60 * 1000,
      acquireTimeout: 60 * 60 * 1000,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [User],
      // shouldn't be used in production - otherwise you can *lose* production data.
      synchronize: false,
    }),
    UsersModule,
    // SystemModule,
    // LoginSmsModule,
    LoginModule,
    LoginEmailModule,
    TwoFactorAuthModule,
    EmailModule,
    VcodeCacheModule,
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

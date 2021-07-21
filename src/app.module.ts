import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from './entities/User.entity';
import { UsersModule } from './users/users.module';
import { Account } from './entities/Account.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AccountsModule } from './accounts/accounts.module';
import { AccountsTokenModule } from './accounts/accounts-token/accounts-token.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { AccountsEmailModule } from './accounts/accounts-email/accounts-email.module';
import { AccountsMetamaskModule } from './accounts/accounts-metamask/accounts-metamask.module';
import { WinstonModule } from 'nest-winston';
import * as fs from 'fs';
import * as winston from 'winston';
const { combine, timestamp, printf, metadata, label } = winston.format;

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
});

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
    WinstonModule.forRoot({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(
        label({ label: 'UCenter' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      ),
      transports: [
        new winston.transports.Console({
          format: combine(winston.format.colorize(), logFormat),
        }),
        new winston.transports.File({
          filename: '/var/log/ucenter/app.log',
          format: combine(
            // Render in one line in your log file.
            // If you use prettyPrint() here it will be really
            // difficult to exploit your logs files afterwards.
            winston.format.json(),
          ),
        }),
      ],
      exitOnError: false,
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
      entities: [User, Account],
      // shouldn't be used in production - otherwise you can *lose* production data.
      synchronize: false,
    }),
    UsersModule,
    // SystemModule,
    // LoginSmsModule,
    AccountsModule,
    TwoFactorAuthModule,
    AccountsEmailModule,
    AccountsTokenModule,
    AccountsMetamaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

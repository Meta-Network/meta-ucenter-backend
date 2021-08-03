import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountsTokenModule } from './accounts/accounts-token/accounts-token.module';
import { AccountsEmailModule } from './accounts/accounts-email/accounts-email.module';
import { AccountsMetamaskModule } from './accounts/accounts-metamask/accounts-metamask.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import * as winston from 'winston';
import * as ormconfig from './config/ormconfig';
import { WinstonModule } from 'nest-winston';
import { SocialAuthModule } from './social-auth/social-auth.module';

const { combine, timestamp, printf, metadata, label } = winston.format;

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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
    TypeOrmModule.forRoot(ormconfig),
    UsersModule,
    // LoginSmsModule,
    AccountsModule,
    TwoFactorAuthModule,
    AccountsEmailModule,
    AccountsTokenModule,
    AccountsMetamaskModule,
    SocialAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

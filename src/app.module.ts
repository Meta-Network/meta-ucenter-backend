import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { User } from './entities/User.entity';
import { UsersModule } from './users/users.module';
import { Account } from './entities/Account.entity';
import { AccountsModule } from './accounts/accounts.module';
import { AccountsTokenModule } from './accounts/accounts-token/accounts-token.module';
import { AccountsEmailModule } from './accounts/accounts-email/accounts-email.module';
import { AccountsMetamaskModule } from './accounts/accounts-metamask/accounts-metamask.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import * as fs from 'fs';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('db.host'),
        ssl: {
          ca: fs.readFileSync('./rds-ca-2019-root.pem', 'utf8').toString(),
        },
        port: configService.get<number>('db.port', 3306),
        connectTimeout: 60 * 60 * 1000,
        acquireTimeout: 60 * 60 * 1000,
        username: configService.get<string>('db.username'),
        password: configService.get<string>('db.password'),
        database: configService.get<string>('db.database'),
        autoLoadEntities: true,
        entities: [User, Account],
        synchronize: false,
      }),
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

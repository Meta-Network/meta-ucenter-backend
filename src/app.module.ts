import { Module } from '@nestjs/common';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppMsController } from './app.ms.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WinstonModule } from 'nest-winston';
import { AccountsModule } from './accounts/accounts.module';
import { SocialAuthModule } from './social-auth/social-auth.module';
import { InvitationModule } from './invitation/invitation.module';
import { AccountsTokenModule } from './accounts/accounts-token/accounts-token.module';
import { AccountsEmailModule } from './accounts/accounts-email/accounts-email.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { AccountsMetamaskModule } from './accounts/accounts-metamask/accounts-metamask.module';
import { InvitationHandlerModule } from './invitation-handler/invitation-handler.module';
import * as winston from 'winston';
import * as ormconfig from './config/ormconfig';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountsWebauthnModule } from './accounts/accounts-webauthn/accounts-webauthn.module';

const { migrations, ...appOrmConfig } = ormconfig as Record<string, any>;
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
    EventEmitterModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'NETWORK_MS_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) =>
          configService.get<ClientProviderOptions>(
            'microservice.clients.network',
          ),
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forRoot(appOrmConfig),
    UsersModule,
    AccountsModule,
    InvitationModule,
    SocialAuthModule,
    TwoFactorAuthModule,
    AccountsEmailModule,
    AccountsTokenModule,
    AccountsWebauthnModule,
    AccountsMetamaskModule,
    InvitationHandlerModule,
  ],
  controllers: [AppController, AppMsController],
  providers: [AppService],
})
export class AppModule {}

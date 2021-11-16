import { Module } from '@nestjs/common';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppMsController } from './app.ms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { SocialAuthModule } from './social-auth/social-auth.module';
import { InvitationModule } from './invitation/invitation.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { AccountsTokenModule } from './accounts/accounts-token/accounts-token.module';
import { AccountsEmailModule } from './accounts/accounts-email/accounts-email.module';
import { AccountsMetamaskModule } from './accounts/accounts-metamask/accounts-metamask.module';
import { AccountsWebauthnModule } from './accounts/accounts-webauthn/accounts-webauthn.module';
import { InvitationHandlerModule } from './invitation-handler/invitation-handler.module';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import * as fs from 'fs';
import { join } from 'path';
import { configPath } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot(configuration),
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
      {
        name: 'CMS_MS_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) =>
          configService.get<ClientProviderOptions>('microservice.clients.cms'),
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('db.host'),
        ssl: {
          ca: fs
            .readFileSync(join(configPath, 'rds-ca-2019-root.pem'), 'utf8')
            .toString(),
        },
        port: configService.get<number>('db.port'),
        connectTimeout: 60 * 60 * 1000,
        acquireTimeout: 60 * 60 * 1000,
        username: configService.get<string>('db.username'),
        password: configService.get<string>('db.password'),
        database: configService.get<string>('db.database'),
        charset: configService.get<string>('db.charset') || 'utf8mb4',
        autoLoadEntities: true,
        entities: ['dist/entities/*.entity.js'],
        synchronize: false,
      }),
    }),
    UsersModule,
    ConfigModule,
    StorageModule,
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

import { Module } from '@nestjs/common';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { SocialAuthModule } from './social-auth/social-auth.module';
import { MicroservicesModule } from './microservices/microservices.module';
import { AccountsTokenModule } from './accounts/accounts-token/accounts-token.module';
import { AccountsMetamaskModule } from './accounts/accounts-metamask/accounts-metamask.module';
import { AccountsWebauthnModule } from './accounts/accounts-webauthn/accounts-webauthn.module';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('db.host'),
        ssl: configService.get<boolean>('db.enableSSL') && {
          ca: fs
            .readFileSync(join(configPath, 'rds-ca-2019-root.pem'), 'utf8')
            .toString(),
        },
        port: configService.get<number>('db.port'),
        connectTimeout: 60 * 60 * 1000,
        // acquireTimeout: 60 * 60 * 1000, // MySQL2 Node.js Driver not support, see: https://github.com/sidorares/node-mysql2/issues/673
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
    SocialAuthModule,
    AccountsTokenModule,
    // AccountsWebauthnModule,
    AccountsMetamaskModule,
    MicroservicesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

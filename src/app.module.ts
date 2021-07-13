import { Module } from '@nestjs/common';
import { JWT_KEY } from './constants';
import { JwtModule } from '@nestjs/jwt';
import { User } from './users/entities/User.entity';
import { AuthModule } from './auth/auth.module';
import { LoginModule } from './login/login.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './system/system.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
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
    LoginModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      signOptions: { expiresIn: '60s' },
      privateKey: JWT_KEY.privateKey,
      publicKey: JWT_KEY.publicKey,
      verifyOptions: {
        algorithms: ['RS256', 'RS384'],
      },
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
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

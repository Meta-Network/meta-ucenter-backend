import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserinfoController } from './userinfo/userinfo.controller';
import { UserinfoService } from './userinfo/userinfo.service';
import { LoginModule } from './login/login.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import fs from 'fs';
import { JWT_KEY } from './constants';
import { SystemModule } from './system/system.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [],
      // shouldn't be used in production - otherwise you can *lose* production data.
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    SystemModule,
  ],
  controllers: [AppController, UserinfoController],
  providers: [AppService, UserinfoService],
})
export class AppModule {}

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
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController, UserinfoController],
  providers: [AppService, UserinfoService],
})
export class AppModule {}

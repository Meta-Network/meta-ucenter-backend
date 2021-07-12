import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserinfoController } from './userinfo/userinfo.controller';
import { UserinfoService } from './userinfo/userinfo.service';
import { LoginModule } from './login/login.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [LoginModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, UserinfoController],
  providers: [AppService, UserinfoService],
})
export class AppModule {}

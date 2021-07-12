import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [LoginController],
  providers: [LoginService],
  imports: [ConfigModule],
})
export class LoginModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '../config/config.service';
import { MicroservicesController } from './microservices.controller';
import { SocialAuthModule } from '../social-auth/social-auth.module';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { UsersModule } from '../users/users.module';
import { MicroservicesService } from './microservices.service';

@Module({
  imports: [
    UsersModule,
    SocialAuthModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'CMS_MS_CLIENT',
        useFactory: async (configService: ConfigService) =>
          configService.get<ClientProviderOptions>('microservice.clients.cms'),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MicroservicesService],
  controllers: [MicroservicesController],
  exports: [MicroservicesService],
})
export class MicroservicesModule {}

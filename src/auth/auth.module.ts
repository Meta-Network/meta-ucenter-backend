import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_KEY } from 'src/constants';
import { AuthService } from './auth.service';
import { JWTStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        issuer: configService.get<string>('jwt.issuer'),
        privateKey: JWT_KEY.privateKey,
        publicKey: JWT_KEY.publicKey,
        verifyOptions: {
          algorithms: ['RS256', 'RS384'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JWTStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

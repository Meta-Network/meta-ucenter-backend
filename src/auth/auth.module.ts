import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_KEY } from 'src/constants';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        signOptions: { expiresIn: process.env.JWTExpiresTime },
        privateKey: JWT_KEY.privateKey,
        publicKey: JWT_KEY.publicKey,
        verifyOptions: {
          algorithms: ['RS256', 'RS384'],
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

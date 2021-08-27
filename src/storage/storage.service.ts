import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../config/config.service';
import { JWTDecodedUser } from '../type';
import crypto from 'crypto';

@Injectable()
export class StorageService {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async signToken(user: JWTDecodedUser) {
    return this.authService.signAny(
      {
        user,
        sub: this.configService.get<string>('storage.sub'),
        iss: this.configService.get<string>('storage.issuer'),
        aud: 'storage',
        jti: crypto.randomBytes(20).toString('hex'),
        purpose: 'access_token',
      },
      {
        algorithm: 'RS256',
        expiresIn: this.configService.get<string>('storage.expires'),
      },
    );
  }
}

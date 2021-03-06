import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_KEY } from '../constants';
import { JWTTokenPayload } from '../type/jwt-payload';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) =>
        req.cookies[this.configService.get<string>('jwt.access_token_name')],
      ignoreExpiration: false,
      secretOrKey: JWT_KEY.privateKey,
      algorithms: ['RS256', 'RS384'],
    });
  }

  async validate(payload: JWTTokenPayload) {
    const result = {
      id: payload.sub,
      ...payload,
    };
    delete result.sub;
    return result;
  }
}

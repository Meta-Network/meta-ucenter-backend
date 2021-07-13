import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AccessTokenData } from '../type/jwt';
import { JWT_KEY } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_KEY.privateKey,
      algorithms: ['RS256', 'RS384'],
    });
  }

  async validate(payload: AccessTokenData) {
    const result = {
      id: payload.sub,
      ...payload,
    };
    delete result.sub;
    return result;
  }
}

import { AccessTokenData } from './jwt';

export type JWTDecodedUser = Omit<AccessTokenData, 'sub'> & { id: number };

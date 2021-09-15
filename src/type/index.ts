import { JWTTokenPayload } from './jwt-payload';
export { SocialAuthBoundMessage } from './social-auth-bound-messages';

export type JWTDecodedUser = Omit<JWTTokenPayload, 'sub'> & { id: number };

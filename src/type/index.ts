import { JWTTokenPayload } from './jwt-payload';
export type JWTDecodedUser = Omit<JWTTokenPayload, 'sub'> & { id: number };

export {
  SocialAuthBoundMessage,
  UserInvitationCountPayload,
} from './app.service';

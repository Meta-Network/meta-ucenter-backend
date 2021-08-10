import { Response } from 'express';
import { User } from 'src/entities/User.entity';
import { AuthorizeRequestDto } from 'src/social-auth/dto/authorize-request.dto';
import { AuthorizeCallbackDto } from 'src/social-auth/dto/authorize-callback.dto';
export interface ISocialAuthStrategy {
  authorizeRequest(
    authorizeRequestDto: AuthorizeRequestDto,
    user: User,
  ): Promise<string>;
  authorizeCallback(
    authorizeCallbackDto: AuthorizeCallbackDto,
    user: User,
    res: Response,
  ): Promise<void>;
  getToken(user: User): Promise<string>;
  refreshToken(user: User): Promise<void>;
}

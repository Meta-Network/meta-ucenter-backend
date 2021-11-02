import { Request, Response } from 'express';
import { User } from 'src/entities/User.entity';
import { AuthorizeRequestDto } from 'src/social-auth/dto/authorize-request.dto';
export interface ISocialAuthStrategy {
  authorizeRequest(
    authorizeRequestDto: AuthorizeRequestDto,
    user: User,
    request: Request,
  ): Promise<string>;
  authorizeCallback(
    authorizeCallbackDto: any,
    user: User,
    response: Response,
    request: Request,
  ): Promise<string>;
  getToken(userId: number): Promise<string>;
  refreshToken(userId: number): Promise<void>;
}

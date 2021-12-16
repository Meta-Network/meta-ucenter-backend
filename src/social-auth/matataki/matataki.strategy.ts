import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { User } from 'src/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SocialAuth } from '../../entities/SocialAuth.entity';
import { AuthorizeRequestDto } from '../dto/authorize-request.dto';
import { ISocialAuthStrategy } from '../type/social-auth.strategy';

@Injectable()
export class MatatakiStrategy implements ISocialAuthStrategy {
  constructor(
    @InjectRepository(SocialAuth)
    private socialAuthRepository: Repository<SocialAuth>,
  ) {}

  async authorizeRequest(
    authorizeRequestDto: AuthorizeRequestDto, // eslint-disable-line @typescript-eslint/no-unused-vars
    user: User, // eslint-disable-line @typescript-eslint/no-unused-vars
    request: Request, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
    throw new BadRequestException(
      'Matataki authorize request is not supported.',
    );
  }

  async authorizeCallback(
    authorizeCallbackDto: any,
    user: User,
    response: Response,
    request: Request, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
    const token = authorizeCallbackDto.token;

    const exists = await this.socialAuthRepository.findOne({
      user_id: user.id,
      type: 'oauth2',
      platform: 'matataki',
    });

    if (exists) {
      await this.socialAuthRepository.save({
        id: exists.id,
        access_token: token,
      });
    } else {
      await this.socialAuthRepository.save({
        user_id: user.id,
        type: 'oauth2',
        platform: 'matataki',
        access_token: token,
      });
    }
    response.redirect(authorizeCallbackDto.redirect_url);
    return token;
  }

  async getToken(userId: number): Promise<string> {
    const auth = await this.socialAuthRepository.findOne({
      user_id: userId,
      type: 'oauth2',
      platform: 'matataki',
    });

    if (!auth) {
      throw new BadRequestException('User Matataki Auth token not found.');
    }

    return auth.access_token;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refreshToken(userId: number): Promise<void> {
    throw new BadRequestException(
      'Matataki OAuth does not have refresh token.',
    );
  }

  async deleteToken(userId: number): Promise<void> {
    await this.socialAuthRepository.delete({
      user_id: userId,
      type: 'oauth2',
      platform: 'matataki',
    });
  }
}

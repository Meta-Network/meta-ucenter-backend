import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from 'src/entities/User.entity';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthorizeRequestDto } from '../dto/authorize-request.dto';
import { AuthorizeCallbackDto } from '../dto/authorize-callback.dto';
import { VcodeCacheService } from 'src/vcode-cache/vcode-cache.service';
import { SocialAuth } from 'src/entities/SocialAuth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as randomstring from 'randomstring';
import axios from 'axios';

@Injectable()
export class GithubStrategy {
  constructor(
    private configService: ConfigService,
    @InjectRepository(SocialAuth)
    private socialAuthRepository: Repository<SocialAuth>,
    private readonly vcodeCacheService: VcodeCacheService,
  ) {}
  async authorizeRequest(
    authorizeRequestDto: AuthorizeRequestDto,
    user: User,
  ): Promise<string> {
    const whitelist = this.configService.get<string[]>('cors.origins');

    // if redirect_url doesn't include whitelist domain
    if (
      !whitelist.some((domain) =>
        authorizeRequestDto.redirect_url.includes(domain),
      )
    ) {
      throw new BadRequestException('Redirect URL is not one of our domain.');
    }

    const state = randomstring.generate();
    await this.vcodeCacheService.set(
      `github_authorize_request_state_by_user_${user.id}`,
      state,
    );

    const origin = new URL(this.configService.get<string>('app.domain'));
    origin.pathname = '/social-auth/github/authorize-callback';
    origin.searchParams.append(
      'redirect_url',
      authorizeRequestDto.redirect_url,
    );

    const result = new URL('https://github.com/login/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('github.client_id'),
    );
    result.searchParams.append('state', state);
    result.searchParams.append('redirect_uri', origin.toString());
    return result.toString();
  }

  async authorizeCallback(
    authorizeCallbackDto: AuthorizeCallbackDto,
    user: User,
    res: Response,
  ): Promise<void> {
    const state = await this.vcodeCacheService.get<string>(
      `github_authorize_request_state_by_user_${user.id}`,
    );
    if (state !== authorizeCallbackDto.state) {
      throw new BadRequestException(
        "The verification state doesn't match our cache.",
      );
    }

    // delete after used it for only once request
    await this.vcodeCacheService.del(
      `github_authorize_request_state_by_user_${user.id}`,
    );

    const form = {
      client_id: this.configService.get<string>('github.client_id'),
      client_secret: this.configService.get<string>('github.client_secret'),
      code: authorizeCallbackDto.code,
    };

    const result = (
      await axios.post('https://github.com/login/oauth/access_token', form, {
        headers: { Accept: 'application/json' },
      })
    ).data;

    const exists = await this.socialAuthRepository.findOne({
      user_id: user.id,
      type: 'oauth2',
      platform: 'github',
    });

    if (exists) {
      await this.socialAuthRepository.save({ id: exists.id, ...result });
    } else {
      await this.socialAuthRepository.save({
        user_id: user.id,
        type: 'oauth2',
        platform: 'github',
        access_token: result.access_token,
      });
    }

    return res.redirect(authorizeCallbackDto.redirect_url);
  }

  async getToken(user: User): Promise<string> {
    const auth = await this.socialAuthRepository.findOne({ user_id: user.id });
    return auth.access_token;
  }
}

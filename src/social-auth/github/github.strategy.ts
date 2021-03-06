import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { User } from 'src/entities/User.entity';
import { ConfigService } from 'src/config/config.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthorizeRequestDto } from '../dto/authorize-request.dto';
import { VcodeCacheService } from 'src/vcode-cache/vcode-cache.service';
import { SocialAuth } from 'src/entities/SocialAuth.entity';
import { ISocialAuthStrategy } from '../type/social-auth.strategy';
import axios from 'axios';
import * as randomstring from 'randomstring';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GithubStrategy implements ISocialAuthStrategy {
  constructor(
    private configService: ConfigService,
    @InjectRepository(SocialAuth)
    private socialAuthRepository: Repository<SocialAuth>,
    private readonly vcodeCacheService: VcodeCacheService,
  ) {}
  async authorizeRequest(
    authorizeRequestDto: AuthorizeRequestDto,
    user: User,
    request: Request,
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

    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const origin = new URL(protocol + '://' + request.get('host'));

    origin.pathname = '/social-auth/github/authorize-callback';
    origin.searchParams.append(
      'redirect_url',
      authorizeRequestDto.redirect_url,
    );

    const result = new URL('https://github.com/login/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.getBiz<string>('github.client_id'),
    );
    result.searchParams.append('state', state);
    result.searchParams.append('scope', 'repo');
    result.searchParams.append('redirect_uri', origin.toString());
    return result.toString();
  }

  async authorizeCallback(
    authorizeCallbackDto: any,
    user: User,
    response: Response,
    request: Request, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
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
      client_id: this.configService.getBiz<string>('github.client_id'),
      client_secret: this.configService.getBiz<string>('github.client_secret'),
      code: authorizeCallbackDto.code,
    };

    const result = (
      await axios.post('https://github.com/login/oauth/access_token', form, {
        headers: { Accept: 'application/json' },
      })
    ).data;

    const res = await axios.get<{ login: string }>(
      'https://api.github.com/user',
      {
        method: 'GET',
        headers: {
          Authorization: `token ${result.access_token}`,
        },
      },
    );

    const username = res.data.login;
    let exist = await this.socialAuthRepository.findOne({
      username,
      type: 'oauth2',
      platform: 'github',
    });

    const allowOverrideAuthorization = this.configService.getBiz<boolean>(
      'github.allow_override_authorization',
    );

    if (exist && allowOverrideAuthorization) {
      await this.socialAuthRepository.remove(exist);
      exist = null;
    }

    if (exist && exist.user_id !== user.id) {
      const redirectTo = new URL(authorizeCallbackDto.redirect_url);
      redirectTo.searchParams.set('error', 'duplicate');
      response.redirect(redirectTo.href);
      return '';
    }

    if (exist) {
      await this.socialAuthRepository.update(exist.id, {
        access_token: result.access_token,
      });
    } else {
      await this.socialAuthRepository.save({
        user_id: user.id,
        type: 'oauth2',
        platform: 'github',
        username,
        access_token: result.access_token,
      });
    }

    response.redirect(authorizeCallbackDto.redirect_url);
    return result.access_token;
  }

  async getToken(userId: number): Promise<string> {
    const auth = await this.socialAuthRepository.findOne({
      user_id: userId,
      type: 'oauth2',
      platform: 'github',
    });
    if (!auth) {
      throw new BadRequestException('User Github OAuth token not found.');
    }
    return auth.access_token;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refreshToken(userId: number): Promise<void> {
    throw new BadRequestException('Github OAuth does not have refresh token.');
  }

  async deleteToken(userId: number): Promise<void> {
    await this.socialAuthRepository.delete({
      user_id: userId,
      type: 'oauth2',
      platform: 'github',
    });
  }
}

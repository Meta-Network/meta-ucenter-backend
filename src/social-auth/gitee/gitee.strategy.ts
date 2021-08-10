import { Response } from 'express';
import { platform } from 'os';
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
export class GiteeStrategy {
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
      `gitee_authorize_request_state_by_user_${user.id}`,
      state,
    );

    const origin = new URL(this.configService.get<string>('app.domain'));
    origin.pathname = '/social-auth/gitee/authorize-callback';
    origin.searchParams.append(
      'redirect_url',
      authorizeRequestDto.redirect_url,
    );

    const result = new URL('https://gitee.com/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('gitee.client_id'),
    );
    result.searchParams.append('state', state);
    result.searchParams.append('response_type', 'code');
    result.searchParams.append('redirect_uri', origin.toString());
    return result.toString();
  }

  async authorizeCallback(
    authorizeCallbackDto: AuthorizeCallbackDto,
    user: User,
    res: Response,
  ): Promise<void> {
    const state = await this.vcodeCacheService.get<string>(
      `gitee_authorize_request_state_by_user_${user.id}`,
    );
    if (state !== authorizeCallbackDto.state) {
      throw new BadRequestException(
        "The verification state doesn't match our cache.",
      );
    }

    // delete after used it for only once request
    await this.vcodeCacheService.del(
      `gitee_authorize_request_state_by_user_${user.id}`,
    );

    const origin = new URL(this.configService.get<string>('app.domain'));
    origin.pathname = '/social-auth/gitee/authorize-callback';
    origin.searchParams.append(
      'redirect_url',
      authorizeCallbackDto.redirect_url,
    );

    const form = {
      redirect_uri: origin.toString(),
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('gitee.client_id'),
      client_secret: this.configService.get<string>('gitee.client_secret'),
      code: authorizeCallbackDto.code,
    };
    const result = (
      await axios.post('https://gitee.com/oauth/token', form, {
        headers: { Accept: 'application/json' },
      })
    ).data;

    const exists = await this.socialAuthRepository.findOne({
      user_id: user.id,
      type: 'oauth2',
      platform: 'gitee',
    });

    if (exists) {
      await this.socialAuthRepository.save({ id: exists.id, ...result });
    } else {
      await this.socialAuthRepository.save({
        user_id: user.id,
        type: 'oauth2',
        platform: 'gitee',
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
    }

    return res.redirect(authorizeCallbackDto.redirect_url);
  }

  async getToken(user: User): Promise<string> {
    const auth = await this.socialAuthRepository.findOne({
      user_id: user.id,
      type: 'oauth2',
      platform: 'gitee',
    });

    if (!auth) {
      throw new BadRequestException(
        `This user has no access token saved for ${platform}.`,
      );
    }

    return auth.access_token;
  }

  async refreshToken(user: User): Promise<void> {
    const auth = await this.socialAuthRepository.findOne({
      user_id: user.id,
      type: 'oauth2',
      platform: 'gitee',
    });

    if (!auth) {
      throw new BadRequestException(
        `This user has no refresh token saved for ${platform}.`,
      );
    }

    const form = {
      grant_type: 'refresh_token',
      refresh_token: auth.refresh_token,
    };

    // TODO: return status of this request
    await axios.post('https://gitee.com/oauth/token', form, {
      headers: { Accept: 'application/json' },
    });
  }
}

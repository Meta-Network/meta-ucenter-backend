import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { User } from 'src/entities/User.entity';
import { ConfigService } from 'src/config/config.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthorizeRequestDto } from '../dto/authorize-request.dto';
import { VcodeCacheService } from 'src/vcode-cache/vcode-cache.service';
import { SocialAuth } from 'src/entities/SocialAuth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as randomstring from 'randomstring';
import axios from 'axios';
import { ISocialAuthStrategy } from '../type/social-auth.strategy';

@Injectable()
export class GiteeStrategy implements ISocialAuthStrategy {
  constructor(
    @InjectRepository(SocialAuth)
    private socialAuthRepository: Repository<SocialAuth>,
    private readonly vcodeCacheService: VcodeCacheService,
    private configService: ConfigService,
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
      `gitee_authorize_request_state_by_user_${user.id}`,
      state,
    );

    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const origin = new URL(protocol + '://' + request.get('host'));

    origin.pathname = '/social-auth/gitee/authorize-callback';
    origin.searchParams.append(
      'redirect_url',
      authorizeRequestDto.redirect_url,
    );

    const result = new URL('https://gitee.com/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.getBiz<string>('gitee.client_id'),
    );
    result.searchParams.append('state', state);
    result.searchParams.append('response_type', 'code');
    result.searchParams.append('redirect_uri', origin.toString());
    return result.toString();
  }

  async authorizeCallback(
    authorizeCallbackDto: any,
    user: User,
    res: Response,
    request: Request,
  ): Promise<string> {
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

    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const origin = new URL(protocol + '://' + request.get('host'));

    origin.pathname = '/social-auth/gitee/authorize-callback';
    origin.searchParams.append(
      'redirect_url',
      authorizeCallbackDto.redirect_url,
    );

    const form = {
      redirect_uri: origin.toString(),
      grant_type: 'authorization_code',
      client_id: this.configService.getBiz<string>('gitee.client_id'),
      client_secret: this.configService.getBiz<string>('gitee.client_secret'),
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
      await this.socialAuthRepository.save({
        id: exists.id,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
    } else {
      await this.socialAuthRepository.save({
        user_id: user.id,
        type: 'oauth2',
        platform: 'gitee',
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
    }

    res.redirect(authorizeCallbackDto.redirect_url);
    return result.access_token;
  }

  async getToken(userId: number): Promise<string> {
    await this.refreshToken(userId);

    const auth = await this.socialAuthRepository.findOne({
      user_id: userId,
      type: 'oauth2',
      platform: 'gitee',
    });

    if (!auth) {
      throw new BadRequestException('User Gitee OAuth token not found.');
    }

    return auth.access_token;
  }

  async refreshToken(userId: number): Promise<void> {
    const auth = await this.socialAuthRepository.findOne({
      user_id: userId,
      type: 'oauth2',
      platform: 'gitee',
    });

    if (!auth) {
      throw new BadRequestException(
        `This user has no refresh token saved for Gitee.`,
      );
    }

    const result = (
      await axios.post(
        'https://gitee.com/oauth/token',
        {
          grant_type: 'refresh_token',
          refresh_token: auth.refresh_token,
        },
        {
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        },
      )
    ).data;

    await this.socialAuthRepository.save({
      id: auth.id,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  }

  async deleteToken(userId: number): Promise<void> {
    await this.socialAuthRepository.delete({
      user_id: userId,
      type: 'oauth2',
      platform: 'gitee',
    });
  }
}

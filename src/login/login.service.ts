import { Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as crypto from 'crypto-js';
// const md5 = require('crypto-js/md5');
import axios from 'axios';

@Injectable()
export class LoginService {
  github_client_id: string;
  github_client_secret: string;

  constructor(private configService: ConfigService) {
    this.github_client_id = this.configService.get<string>('GITHUB_CLIENT_ID');
    this.github_client_secret = this.configService.get<string>(
      'GITHUB_CLIENT_SECRET',
    );
  }

  // https://stackoverflow.com/questions/41038425/how-to-use-cryptojs-with-angular-2-and-typescript-in-webpack-build-environment
  generateCaptcha(email: string): string {
    const timestamp = Date.now();
    const random_string = timestamp + email + 'salt5';
    const md5_raw = crypto.MD5(random_string).words[0];
    const md5_str = Math.abs(md5_raw).toString();

    let reply_captcha;
    if (md5_str.length < 6) {
      reply_captcha = '0'.repeat(6 - md5_str.length) + md5_str;
    } else {
      reply_captcha = md5_str.substring(md5_str.length - 6, md5_str.length);
    }
    // log and store;
    return reply_captcha;
    // return 'aa';
  }

  saveCaptcha(): string {
    return '';
  }

  sendCaptcha(): string {
    return '';
  }

  verifyCaptcha(): string {
    return '';
  }

  getLoginPage(): string {
    return `<p><a href="https://github.com/login/oauth/authorize?client_id=${this.github_client_id}&scope=read:public_repo,read:user,user:email">GitHub Login</a></p>`;
  }

  // verifyLoginCode(code: string) {
  //   axios({
  //     method: 'GET',
  //     url: 'https://api.github.com/',
  //     data: {
  //       Accept: 'application/json',
  //       client_id: '',
  //       client_secret: '',
  //       code: code,
  //     },
  //   })
  //     .then((response) => {
  //       console.log(response.data);
  //       return true;
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       return false;
  //     });
  // }

  async verifyLoginCodeAsync(code: string): Promise<string> {
    const verifyCodeRequest = await axios({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        Accept: 'application/json',
      },
      data: {
        client_id: this.github_client_id,
        client_secret: this.github_client_secret,
        code: code,
      },
      // proxy: {
      //   protocol: 'http',
      //   host: '127.0.0.1',
      //   port: 1080,
      //   auth: {
      //     username: '',
      //     password: '',
      //   },
      // },
    });
    console.log(verifyCodeRequest.data);
    const user_access_token = verifyCodeRequest.data.access_token;
    if (!user_access_token) {
      return 'bad end';
    }
    const userInfoRequest = await axios({
      method: 'GET',
      url: 'https://api.github.com/user',
      headers: {
        Authorization: 'token ' + user_access_token,
        accept: 'application/vnd.github.v3+json',
      },
    });
    console.log(userInfoRequest.data);
    const reply_content =
      `<p>username: ${userInfoRequest.data.login}</p>` +
      `<p>id: ${userInfoRequest.data.id}</p>` +
      `<p>url: ${userInfoRequest.data.url}</p>` +
      `<img src="${userInfoRequest.data.avatar_url}">`;
    return reply_content;
  }
}

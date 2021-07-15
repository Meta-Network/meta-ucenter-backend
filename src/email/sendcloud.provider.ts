import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as querystring from 'querystring';
import { IEmailSender } from './email-sender.interface';

@Injectable()
export class SendcloudProvider implements IEmailSender {
  constructor(private readonly configService: ConfigService) {}

  async send({ from, fromName, to, templateInvokeName }, placeholders) {
    const API_USER = this.configService.get<string>('SENDCLOUD_USER');
    const API_KEY = this.configService.get<string>('SENDCLOUD_KEY');
    const xSmtpapi = {
      to: [to],
      sub: {
        '%code%': [placeholders.code],
      },
    };
    const params = {
      apiUser: API_USER,
      apiKey: API_KEY,
      from,
      fromName,
      to,
      templateInvokeName,
      xsmtpapi: JSON.stringify(xSmtpapi),
    };
    const querystringParams = querystring.stringify(params);
    return await axios.post(
      `https://api.sendcloud.net/apiv2/mail/sendtemplate?${querystringParams}`,
    );
  }
}

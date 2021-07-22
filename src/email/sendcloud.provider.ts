import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailSender } from './email-sender.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import axios from 'axios';
import * as querystring from 'querystring';

@Injectable()
export class SendcloudProvider implements IEmailSender {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async send({ from, fromName, to, templateInvokeName }, placeholders) {
    const API_USER = this.configService.get<string>('sendcloud.user');
    const API_KEY = this.configService.get<string>('sendcloud.key');
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
    const url = `https://api.sendcloud.net/apiv2/mail/sendtemplate?${querystringParams}`;
    const result = (await axios.post(url)).data;
    this.logger.info(JSON.stringify({ request: xSmtpapi, response: result }), {
      label: 'SendCloud',
    });
    return result;
  }
}

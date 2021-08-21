// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { IEmailSender } from './email-sender.interface';
import axios from 'axios';
import * as querystring from 'querystring';

@Injectable()
export class SendcloudProvider implements IEmailSender {
  constructor(private readonly configService: ConfigService) {}

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

    if (this.configService.get<boolean>('dingding_bot.on') === true) {
      axios.post(this.configService.get<string>('dingding_bot.api'), {
        msgtype: 'text',
        text: {
          content: `提醒：[UCenter SendCloud] 验证码上报：邮箱(${xSmtpapi.to[0]}) 验证码(${xSmtpapi.sub['%code%'][0]})`,
        },
      });
    }

    return result;
  }
}

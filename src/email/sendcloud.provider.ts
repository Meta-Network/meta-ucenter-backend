// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { IEmailSender } from './email-sender.interface';
import axios from 'axios';
import * as querystring from 'querystring';

@Injectable()
export class SendcloudProvider implements IEmailSender {
  constructor(private readonly configService: ConfigService) {}

  async send(to, placeholders) {
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
      from: this.configService.getBiz<string>('email.from_email'),
      fromName: this.configService.getBiz<string>('email.from_name'),
      to,
      templateInvokeName: this.configService.get<string>(
        'sendcloud.template_invoke_name_vcode',
      ),
      xsmtpapi: JSON.stringify(xSmtpapi),
    };
    const querystringParams = querystring.stringify(params);
    const url = `https://api.sendcloud.net/apiv2/mail/sendtemplate?${querystringParams}`;
    const result = (await axios.post(url)).data;
    console.log(result);
    console.log(this.configService.getBiz<string>('dingding_bot.api'));

    if (this.configService.getBiz<boolean>('dingding_bot.enabled') === true) {
      axios.post(this.configService.getBiz<string>('dingding_bot.api'), {
        msgtype: 'text',
        text: {
          content: `提醒：[UCenter SendCloud] 验证码上报：邮箱(${to}) 验证码(${placeholders.code})`,
        },
      });
    }

    return result;
  }
}

import { Injectable } from '@nestjs/common';
import { IEmailSender } from './email-sender.interface';
import { ConfigService } from 'src/config/config.service';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import axios from 'axios';

const mailgun = new Mailgun(formData);

@Injectable()
export class MailgunProvider implements IEmailSender {
  constructor(private readonly configService: ConfigService) {}

  mg = mailgun.client({
    username: 'api',
    key: this.configService.get<string>('mailgun.key'),
  });

  getTemplate(code: string | number) {
    return `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title></title><div style="width: 100%;min-height: 500px;background: #f6f6f6; padding: 0 20px;box-sizing: border-box;"><div style="max-width: 600px;margin: 0 auto;padding-top: 50px;"><img alt="logo" src="https://miro.medium.com/max/1018/1*qpAv8UXA7xa8Do4nswMmlA.png" style="width: 180px;margin-bottom: 16px;" /><div style="width: 100%;background: #fff;padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,.05);border-radius: 3px;box-sizing: border-box;"><p style="line-height: 1.5;margin: 0;padding: 0;font-size: 16px;">Hi,</p><p style="line-height: 1.5;margin: 20px 0;padding: 0;font-size: 16px;">你进行登录的验证码是（如果不是本人，请不要做任何操作）：</p><p style="line-height: 1.5;letter-spacing: 1px;margin: 0;padding: 0;font-size: 30px;font-weight: 800;color: #542DE0;">${code}</p><p style="color: #989898;margin-top: 30px;font-size: 14px;">Copyright &copy; 2018-2021 Meta Network</p></div></div>`;
  }

  async send(to: string, placeholders: { [key: string]: string }) {
    const name = this.configService.getBiz<string>('email.from_name');
    const email = this.configService.getBiz<string>('email.from_email');
    const result = await this.mg.messages.create(
      this.configService.get<string>('mailgun.domain'),
      {
        from: `${name} <${email}>`,
        to: [to],
        subject: 'Meta Network 登录验证码',
        html: this.getTemplate(placeholders.code),
      },
    );

    if (this.configService.getBiz<boolean>('dingding_bot.enabled') === true) {
      axios.post(this.configService.getBiz<string>('dingding_bot.api'), {
        msgtype: 'text',
        text: {
          content: `提醒：[UCenter Mailgun] 验证码上报：邮箱(${to}) 验证码(${placeholders.code})`,
        },
      });
    }

    return result;
  }
}

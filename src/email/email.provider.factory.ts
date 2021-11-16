import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { MailgunProvider } from './mailgun.provider';
import { SendcloudProvider } from './sendcloud.provider';
import { IEmailSender } from './email-sender.interface';

@Injectable()
export class EmailProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailgunProvider: MailgunProvider,
    private readonly sendcloudProvider: SendcloudProvider,
  ) {}

  public getService(): IEmailSender {
    const context = this.configService.getBiz<string>('email.service');
    const services = {
      sendcloud: this.sendcloudProvider,
      mailgun: this.mailgunProvider,
    };

    if (services[context]) {
      return services[context];
    } else {
      throw new Error(`No provider defined for the context: "${context}"`);
    }
  }
}

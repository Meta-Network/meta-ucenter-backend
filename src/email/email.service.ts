import { Injectable } from '@nestjs/common';
import { IEmailSender } from './email-sender.interface';
import { EmailProviderFactory } from './email.provider.factory';

@Injectable()
export class EmailService implements IEmailSender {
  constructor(private readonly emailFactory: EmailProviderFactory) {}
  emailProvider = this.emailFactory.getService();

  async send(to: string, placeholders: { [key: string]: string }) {
    await this.emailProvider.send(to, placeholders);
  }
}

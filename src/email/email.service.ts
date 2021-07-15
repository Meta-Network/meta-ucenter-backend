import { Inject, Injectable } from '@nestjs/common';
import { IEmailSender } from './email-sender.interface';
import { SendcloudProvider } from './sendcloud.provider';

@Injectable()
export class EmailService implements IEmailSender {
  constructor(
    // @Inject('SendcloudProvider')
    // private readonly emailSender: IEmailSender,
    private readonly emailSender: SendcloudProvider,
  ) {}
  send(
    {
      from,
      fromName,
      to,
      templateInvokeName,
    }: { from: any; fromName: any; to: any; templateInvokeName: any },
    placeholders: any,
  ) {
    this.emailSender.send(
      { from, fromName, to, templateInvokeName },
      placeholders,
    );
  }
}

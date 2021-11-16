import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailgunProvider } from './mailgun.provider';
import { SendcloudProvider } from './sendcloud.provider';
import { EmailProviderFactory } from './email.provider.factory';

@Module({
  providers: [
    EmailService,
    MailgunProvider,
    SendcloudProvider,
    EmailProviderFactory,
  ],
  exports: [EmailService],
})
export class EmailModule {}

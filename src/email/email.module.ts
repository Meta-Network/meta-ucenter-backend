import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendcloudProvider } from './sendcloud.provider';

@Module({
  providers: [SendcloudProvider, EmailService],
  exports: [EmailService],
})
export class EmailModule {}

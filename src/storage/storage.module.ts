import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [AuthModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}

import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  static forRoot(options): DynamicModule {
    return {
      // global: options.isGlobal,
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}

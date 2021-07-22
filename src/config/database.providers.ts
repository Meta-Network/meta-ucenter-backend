import { ConfigService } from '@nestjs/config';
import { createConnection } from 'typeorm';
import * as fs from 'fs';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) =>
      await createConnection({
        type: 'mysql',
        host: configService.get('db.host'),
        port: 3306,
        connectTimeout: 60 * 60 * 1000,
        acquireTimeout: 60 * 60 * 1000,
        username: configService.get('db.username'),
        password: configService.get('db.password'),
        database: configService.get('db.name'),
        entities: [__dirname + '/../entities/*.entity.ts'],
        ssl: {
          ca: fs.readFileSync('./rds-ca-2019-root.pem', 'utf8').toString(),
        },
        synchronize: false,
      }),
  },
];

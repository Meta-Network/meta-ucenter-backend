import { readFileSync } from 'fs';
import getConfig from './configuration';

class DB {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connect_timeout: number;
}

const { db } = getConfig() as { db: DB };

module.exports = {
  type: 'mysql',
  host: db.host,
  ssl: {
    rejectUnauthorized: true,
    ca: readFileSync('rds-ca-2019-root.pem').toString(),
  },
  port: db.port || 3306,
  username: db.username,
  password: db.password,
  database: db.database,
  connectTimeout: db.connect_timeout,
  synchronize: false,
  entities: ['dist/entities/*.entity.js'],
  migrations: ['*.ts'],
  cli: {
    entitiesDir: 'entities',
    migrationsDir: 'migration',
  },
};

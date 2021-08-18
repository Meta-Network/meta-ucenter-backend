import { readFileSync } from 'fs';
import getConfig from './configuration';

class DB {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
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
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: ['dist/entities/*.entity.js'],
  migrations: ['migration/*.ts'],
  cli: {
    entitiesDir: 'entities',
    migrationsDir: 'migration',
  },
};

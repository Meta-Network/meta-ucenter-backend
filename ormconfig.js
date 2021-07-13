require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.devlopment',
});
const fs = require("fs");
const path = require('path');

console.info('pr', process.env.NODE_ENV);
console.info(process.env.DB_NAME);

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  ssl: {
    rejectUnauthorized: true,
    ca: fs
      .readFileSync(path.resolve(__dirname) + '/rds-ca-2019-root.pem')
      .toString(),
  },
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['migration/**/*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
};

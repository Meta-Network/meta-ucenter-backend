const { join } = require('path');
const yaml = require('js-yaml');
const { readFileSync } = require('fs');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.production.yaml'
    : 'config.development.yaml';

const config = yaml.load(
  readFileSync(join(__dirname, 'config', YAML_CONFIG_FILENAME), 'utf8'),
);

module.exports = {
  type: 'mysql',
  host: config.db.host,
  ssl: {
    rejectUnauthorized: true,
    ca: readFileSync(join(__dirname, 'config', 'rds-ca-2019-root.pem'))
      .toString(),
  },
  port: config.db.port || 3306,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  charset: config.db.charset || 'utf8mb4',
  timezone: config.db.timezone || 'Z',
  synchronize: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['migration/**/*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
};

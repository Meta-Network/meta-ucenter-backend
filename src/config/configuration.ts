import { join } from 'path';

const configPath =
  process.env.CONFIG_PATH || join(__dirname, '..', '..', 'config');

const YAML_BIZ_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.biz.production.yaml'
    : 'config.biz.development.yaml';

const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.production.yaml'
    : 'config.development.yaml';

// '__dirname/../..' refers to the project root folder
export default {
  filePath: join(configPath, YAML_CONFIG_FILENAME),
  bizFilePath: join(configPath, YAML_BIZ_CONFIG_FILENAME),
};

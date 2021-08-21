import * as yaml from 'js-yaml';
import { readFileSync, watch } from 'fs';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly logger: Logger = new Logger(this.constructor.name);
  private config: any;
  private configBiz: any;

  constructor(
    @Inject('CONFIG_OPTIONS')
    private options: { bizFilePath: string; filePath: string },
  ) {
    if (options.filePath) {
      watch(options.filePath, 'utf-8', () => {
        this.logger.log('Config file changed');
        this.loadFile();
      });
      this.loadFile();
    }

    if (options.bizFilePath) {
      watch(options.bizFilePath, 'utf-8', () => {
        this.logger.log('Biz Config file changed');
        this.loadBizFile();
      });

      this.loadBizFile();
    }
  }

  /**
   * Get a configuration value (either custom configuration or process environment variable)
   * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
   * @param propertyPath
   * @param defaultValue
   */
  public get<T = any>(propertyPath, defaultValue?): T | undefined {
    return (
      propertyPath.split('.').reduce((o, i) => o[i], this.config) ||
      defaultValue
    );
  }

  /**
   * Get a biz configuration value (either custom configuration or process environment variable)
   * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
   * @param propertyPath
   * @param defaultValue
   */
  public getBiz<T = any>(propertyPath, defaultValue?): T | undefined {
    return (
      propertyPath.split('.').reduce((o, i) => o[i], this.configBiz) ||
      defaultValue
    );
  }

  private loadFile() {
    this.config = yaml.load(
      readFileSync(this.options.filePath, 'utf8'),
    ) as Record<string, any>;
  }

  private loadBizFile() {
    this.configBiz = yaml.load(
      readFileSync(this.options.bizFilePath, 'utf8'),
    ) as Record<string, any>;
  }
}

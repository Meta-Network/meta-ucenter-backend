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
    watch(options.filePath, 'utf-8', () => {
      this.logger.log('Config file changed');
      this.loadFile();
    });
    this.loadFile();

    watch(options.bizFilePath, 'utf-8', () => {
      this.logger.log('Biz Config file changed');
      this.loadBizFile();
    });

    this.loadBizFile();
  }

  private getValue<T = any>(configType, propertyPath): T | undefined {
    try {
      return propertyPath.split('.').reduce((o, i) => o[i], configType);
    } catch (error) {
      throw new ReferenceError(
        `Accessing to property "${propertyPath}" from ${
          configType === this.configBiz ? 'Biz Config' : 'Config'
        } doesn't exist.`,
      );
    }
  }

  /**
   * Get a configuration value (either custom configuration or process environment variable)
   * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
   * @param propertyPath
   */
  public get<T = any>(propertyPath): T {
    return this.getValue(this.config, propertyPath);
  }

  /**
   * Get a biz configuration value (either custom configuration or process environment variable)
   * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
   * @param propertyPath
   */
  public getBiz<T = any>(propertyPath): T {
    return this.getValue(this.configBiz, propertyPath);
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

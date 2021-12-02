import * as randomstring from 'randomstring';
import { Injectable } from '@nestjs/common';
import { VcodeCacheService } from '../vcode-cache/vcode-cache.service';

@Injectable()
export class VerificationCodeService {
  constructor(private readonly vcodeCacheService: VcodeCacheService) {}

  /**
   * 生成随机校验码的服务。
   * <p>
   * 将验证码以{key}作为键，保存于 Redis 或其他临时存储媒介
   * 保存的验证码会于指定时间内失效。删除相关存储。
   * {key} 可以是用户名或时间戳
   * {prefix} 自动添加在key之前，用于甄别key的应用
   * {options} randomstring 的生成参数
   * </p>
   * @param {string} prefix
   * @param {string} key
   * @param options
   * @returns {Promise<string>}
   */
  async generateVcode(
    prefix: string,
    key: string,
    options: { length: number; charset: string; capitalization?: string } = {
      length: 8,
      charset: 'alphanumeric',
      capitalization: 'uppercase',
    },
  ): Promise<string> {
    const savedKey = `${prefix}_${key}`;
    // clear the remain saved values
    await this.vcodeCacheService.del(savedKey);

    const code = randomstring.generate(options);
    await this.vcodeCacheService.set<string>(savedKey, code);
    return code;
  }

  /**
   * 校验验证码是否与本地生成的一致。
   * 如果{code}同以传入的{key}保存的验证码相同
   * @param prefix
   * @param {string} key
   * @param {string} code
   * @returns {Promise<boolean>}
   */
  async verify(prefix: string, key: string, code: string): Promise<boolean> {
    return (
      code === (await this.vcodeCacheService.get<string>(`${prefix}_${key}`))
    );
  }

  /**
   * 清除指定的验证码
   * @param prefix
   * @param {string} key
   * @returns {Promise<void>}
   */
  async clear(prefix: string, key: string): Promise<void> {
    await this.vcodeCacheService.del(`${prefix}_${key}`);
  }

  /**
   * 获取本地生成的校验码。
   * @param prefix
   * @param {string} key
   * @returns {Promise<string>}
   */
  async getVcode(prefix: string, key: string): Promise<string> {
    return await this.vcodeCacheService.get<string>(`${prefix}_${key}`);
  }

  async getMultiAttemptsCount(prefix: string, key: string): Promise<number> {
    return (await this.vcodeCacheService.get<number>(`${prefix}_${key}`)) ?? 0;
  }

  /**
   * 设置一位用户（以 ip 或其他形式）的某一行为的多次尝试次数。
   * @param {string} prefix
   * @param {string} key
   * @param {number} count
   * @returns {Promise<void>}
   */
  async setMultiAttemptsCount(
    prefix: string,
    key: string,
    count: number,
  ): Promise<number> {
    await this.vcodeCacheService.set<number>(`${prefix}_${key}`, count);
    return count;
  }

  /**
   * 检查一位用户（以 ip）是否处于某种冷却状态。
   * @param {string} prefix
   * @param {string} key
   * @returns {Promise<number>}
   */
  async getIPInCoolDown(prefix: string, key: string): Promise<number> {
    return await this.vcodeCacheService.get<number>(`${prefix}_${key}`);
  }

  /**
   * 设置一位用户（以 ip）是否处于某种冷却状态。
   * @param {string} prefix
   * @param {string} key
   * @param {number} seconds
   * @param {number} ttl
   * @returns {Promise<void>}
   */
  async setIPInCoolDown(
    prefix: string,
    key: string,
    seconds: number,
    ttl: number,
  ): Promise<void> {
    const until = Date.now() + seconds * 1000;
    await this.vcodeCacheService.setWithTTL<number>(
      `${prefix}_${key}`,
      until,
      ttl,
    );
  }
}

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
   * {key}可以是用户名或时间戳，返回值为验证码。
   * </p>
   * @param {string} key
   * @returns {Promise<string>}
   */
  async generateVcode(key: string): Promise<string> {
    // clear the remain saved values
    await this.vcodeCacheService.del(key);

    const code = randomstring.generate({
      length: 6,
      charset: 'numeric',
    });
    await this.vcodeCacheService.set(key, code);
    return code;
  }

  /**
   * 校验验证码是否与本地生成的一致。
   * 如果{code}同以传入的{key}保存的验证码相同
   * @param {string} key
   * @param {string} code
   * @returns {Promise<boolean>}
   */
  async verify(key: string, code: string): Promise<boolean> {
    return code === (await this.vcodeCacheService.get(key));
  }

  /**
   * 获取本地生成的校验码。
   * @param {string} key
   * @returns {Promise<string>}
   */
  async getVcode(key: string): Promise<string> {
    return await this.vcodeCacheService.get(key);
  }
}

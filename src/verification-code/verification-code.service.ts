import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationCodeService {
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
  async generate(key: string): Promise<string> {
    const code = 'random code';
    // TODO: redis store code
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
    //TODO repo.get(key)===code;
    return true;
  }
}

import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationCodeDto {
  @ApiProperty({
    description: '生成验证码使用的 key，保存于 Redis 中建立与验证码的对应关系',
  })
  @IsNotEmpty()
  key: string;
}

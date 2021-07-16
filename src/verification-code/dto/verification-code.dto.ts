import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationCodeDto {
  @ApiProperty({
    description: '验证码发送到的地方，根据特定服务可以是邮箱或手机号等',
    default: 'someone@example.com',
  })
  @IsNotEmpty()
  key: string;
}

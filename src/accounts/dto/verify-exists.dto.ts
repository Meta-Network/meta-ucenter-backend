import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class VerifyExistsDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '检查该账号是否已被注册',
  })
  @IsNotEmpty()
  @MaxLength(220)
  account: string;
}

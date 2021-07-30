import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyExistsDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '检查该邮箱是否已被注册',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

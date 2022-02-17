import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsEmail,
  IsNotEmpty,
  IsAlphanumeric,
  MaxLength,
} from 'class-validator';

export class AccountsEmailDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '登录使用的邮箱。验证码会发送至此邮箱里',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(220)
  account: string;

  @ApiProperty({
    default: 'L6OH5E5P',
    description: '生成后发送至登录者邮箱的，与邮箱绑定的验证码',
  })
  @IsNotEmpty()
  @Length(8)
  @IsAlphanumeric()
  verifyCode: string;
}

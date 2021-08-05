import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

export class AccountsEmailDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '登录使用的邮箱。验证码会发送至此邮箱里',
  })
  @IsNotEmpty()
  @MaxLength(220)
  @IsEmail()
  account: string;

  @ApiProperty({
    default: '571802',
    description: '生成后发送至登录者邮箱的，与邮箱绑定的验证码',
  })
  @IsNotEmpty()
  @Length(6)
  @IsNumberString()
  verifyCode: string;

  @ApiProperty({
    default: 'hcaptcha_token_here',
    description: '由 hCaptcha 生成的人机验证 Token，从前端获得',
  })
  @IsNotEmpty()
  hcaptchaToken: string;
}

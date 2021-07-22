import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class AccountsEmailDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '登陆使用的邮箱。验证码会发送至此邮箱里',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    default: '571802',
    description: '生成后发送至登陆者邮箱的，与邮箱绑定的验证码',
  })
  @IsNotEmpty()
  @IsNumberString()
  verifyCode: string;

  @ApiProperty({
    default: 'hcaptcha_token_here',
    description: '由 hCaptcha 生成的人机验证 Token，从前端获得',
  })
  @IsNotEmpty()
  hcaptchaToken: string;

  @ApiProperty({
    default: ['ucenter'],
    description: 'Tokens 的受众',
  })
  @IsNotEmpty()
  aud: string | string[];
}

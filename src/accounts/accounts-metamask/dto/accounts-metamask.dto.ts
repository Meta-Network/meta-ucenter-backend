import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class AccountsMetaMaskDto {
  @ApiProperty({
    default: '0x1234567890',
    description: '登陆使用的钱包地址，与认证码对应',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: '前端回传的对 WebMask 的签名校验',
  })
  @IsNotEmpty()
  signature: string;

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

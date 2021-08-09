import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, MaxLength } from 'class-validator';

export class AccountsMetaMaskDto {
  @ApiProperty({
    default: '0x1234567890',
    description: '登录使用的钱包地址，与认证码对应',
  })
  @MaxLength(220)
  @IsNotEmpty()
  account: string;

  @ApiProperty({
    description: '前端回传的对 WebMask 的签名校验',
  })
  @Length(132)
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    default: 'hcaptcha_token_here',
    description: '由 hCaptcha 生成的人机验证 Token，从前端获得',
  })
  @IsNotEmpty()
  hcaptchaToken: string;
}

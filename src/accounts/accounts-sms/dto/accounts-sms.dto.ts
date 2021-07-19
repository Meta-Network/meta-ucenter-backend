import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsPhoneNumber } from 'class-validator';

export class AccountsSmsDto {
  @ApiProperty({
    default: '13102278990',
    description: '登陆用的手机号。验证码将发送至该手机短信',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    default: '571802',
    description: '生成后发送至登陆者手机短信的，与手机绑定的验证码',
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
}

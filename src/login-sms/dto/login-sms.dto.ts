import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsPhoneNumber } from 'class-validator';

export class LoginSmsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  verifyCode: string;

  @ApiProperty()
  @IsNotEmpty()
  hcaptchaToken: string;
}

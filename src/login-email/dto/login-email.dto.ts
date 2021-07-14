import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class LoginEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  verifyCode: string;

  @ApiProperty()
  @IsNotEmpty()
  hcaptchaToken: string;
}

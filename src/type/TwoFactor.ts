import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum TwoFactorType {
  TOTP = 'TOTP',
  EmailCode = 'EmailCode',
}

export class TwoFactorVerifyRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TwoFactorType)
  type: TwoFactorType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

import { IsEnum, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TwoFactorType } from 'src/type/TwoFactor';

export class BindTwoFactorDto {
  @ApiProperty({
    enum: TwoFactorType,
  })
  @IsEnum(TwoFactorType)
  type: TwoFactorType;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    enum: TwoFactorType,
  })
  @IsEnum(TwoFactorType)
  type: TwoFactorType;

  @ApiProperty()
  @IsNumberString()
  code: string;
}

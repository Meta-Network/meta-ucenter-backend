import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  key: string;
}

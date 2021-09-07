import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ValidateInvitationDto {
  @ApiProperty({
    description: '传入一个邀请码',
  })
  @IsNotEmpty()
  invitation: string;
}

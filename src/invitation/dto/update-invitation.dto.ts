import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateInvitationDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '主体，邀请对象名称',
  })
  @IsOptional()
  @IsNotEmpty()
  sub?: string;

  @ApiProperty({
    default: 'welcome to meta network',
    description: '邀请信息',
  })
  @IsOptional()
  @IsNotEmpty()
  message?: string;
}

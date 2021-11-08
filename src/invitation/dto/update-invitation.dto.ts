import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateInvitationDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '主体，邀请对象名称',
  })
  @IsOptional()
  sub?: string;

  @ApiProperty({
    default: 'welcome to meta network',
    description: '邀请信息',
  })
  @IsOptional()
  message?: string;
}

import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorizeRequestDto {
  @ApiProperty({
    description: '完成认证后的返回跳转地址',
  })
  @IsUrl()
  redirect_url: string;
}

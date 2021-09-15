import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AuthorizeCallbackDto {
  @ApiProperty({
    description: '第三方平台回传的认证 code',
  })
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: '本地提前生成并由第三方平台回传的随机字符串',
  })
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: '认证完成后进行跳转的链接',
  })
  @IsNotEmpty()
  redirect_url: string;
}

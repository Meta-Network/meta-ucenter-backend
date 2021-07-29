import { ApiProperty } from '@nestjs/swagger';

export class AuthorizeCallbackDto {
  @ApiProperty({
    description: '第三方平台回传的认证 code',
  })
  code: string;

  @ApiProperty({
    description: '认证完成后进行跳转的链接',
  })
  redirect_url: string;

  @ApiProperty({
    description: '本地提前生成并由第三方平台回传的随机字符串',
  })
  state: string;
}

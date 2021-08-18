import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsNotEmpty, Length } from 'class-validator';

export class AccountsWebAuthNDto {
  @ApiProperty({
    default: 'metafan',
    description: '用于登录的用户名',
  })
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(3, 32)
  account: string;

  @ApiProperty({
    description: '前端回传的 WebAuthN 校验信息',
  })
  @IsNotEmpty()
  credential: any;
}

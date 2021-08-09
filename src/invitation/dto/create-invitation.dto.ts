import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    default: 'someone@example.com',
    description: '主体，邀请对象名称',
  })
  @IsNotEmpty()
  sub: string;

  @ApiProperty({
    default: 'welcome to meta network',
    description: '邀请信息',
  })
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    default: 0,
    description: '邀请者用户 id，无特定用户可填0',
  })
  @IsNotEmpty()
  inviter_user_id: number;

  @ApiProperty({ description: '邀请被创建的原因，用以区分创建邀请的多种方式' })
  @IsNotEmpty()
  cause: string;

  @ApiProperty({
    default: 0,
    description: '是发送给 matataki 用户则填入其id，不是则填0',
  })
  @IsNotEmpty()
  matataki_user_id: number;

  // TODO: verify at user signup
  @ApiProperty({
    description: '邀请的到期时间',
  })
  @IsNotEmpty()
  expired_at: Date;
}

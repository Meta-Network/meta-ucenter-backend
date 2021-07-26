import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  // TODO: add validate
  @ApiPropertyOptional({
    default: 'Brendan Eich',
    description: '用户昵称',
  })
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    default: 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png',
    description: '用户头像',
  })
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    default: 'some description of this user',
    description: '个人简介',
  })
  @IsOptional()
  bio?: string;
}

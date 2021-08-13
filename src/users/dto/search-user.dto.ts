import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiPropertyOptional({
    default: 23,
    description: '用户id',
  })
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({
    default: 'username',
    description: '用户名',
  })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    default: '加菲',
    description: '用户昵称',
  })
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    default: 'some description of this user',
    description: '个人简介',
  })
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    default: '{ "take": 10, "skip": 0 }',
    description: '查询选项，可不填则默认为获取全部数据',
  })
  @IsOptional()
  options?: { take: number; skip: number };
}

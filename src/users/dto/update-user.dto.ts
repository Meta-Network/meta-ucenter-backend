import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  nickname?: string;

  @ApiProperty()
  @IsOptional()
  avatar?: string;

  @ApiProperty()
  @IsOptional()
  bio?: string;
}

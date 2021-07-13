import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  nickname?: string;

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  bio?: string;
}

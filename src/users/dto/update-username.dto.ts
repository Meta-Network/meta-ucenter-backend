import { IsAlphanumeric, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsernameDto {
  @ApiPropertyOptional({
    default: 'metafan',
    description: '用户名',
  })
  @IsAlphanumeric()
  @Length(3, 32)
  username: string;
}

import { IsAlphanumeric, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateUsernameDto {
  @ApiPropertyOptional({
    default: 'metafan',
    description: '用户名',
  })
  @Length(3, 15)
  @IsAlphanumeric()
  username: string;
}

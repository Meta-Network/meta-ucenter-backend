import { Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateUsernameDto {
  @ApiPropertyOptional({
    default: 'metafan',
    description: '用户名',
  })
  @Length(3, 15)
  @Matches(/^[a-z0-9-]+$/)
  username: string;
}

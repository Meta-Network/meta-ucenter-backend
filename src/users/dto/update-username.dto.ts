import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsernameDto {
  @ApiPropertyOptional({
    default: 'user_name_here',
    description: '设置用户的用户名，仅可设置一次',
  })
  username: string;
}

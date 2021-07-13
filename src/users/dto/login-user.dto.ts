import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  verifyCode: string;
}

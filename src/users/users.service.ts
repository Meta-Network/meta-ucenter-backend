import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private authService: AuthService) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  login(uid: number) {
    const u = this.users.find(({ userId }) => {
      return userId === uid;
    });
    return this.authService.login(u);
  }
}

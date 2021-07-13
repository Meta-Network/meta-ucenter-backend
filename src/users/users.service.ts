import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from '../entities/User.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async login(loginUser: LoginUserDto, aud = 'ucenter') {
    // TODO: verify the verifyCode first
    const user: User =
      (await this.usersRepository.findOne({
        username: loginUser.username,
      })) ||
      (await this.usersRepository.save({ username: loginUser.username }));

    return this.authService.signJWT(user, aud);
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    return this.usersRepository.findOne(uid);
  }
}

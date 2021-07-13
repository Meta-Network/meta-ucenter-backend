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

  // login(uid: number, aud = 'ucenter') {
  //   const u = this.usersRepository.find();
  // }

  async login(loginUser: LoginUserDto, aud = 'ucenter') {
    // TODO: verify the verifyCode first
    let user: User = await this.usersRepository.findOne({
      username: loginUser.username,
    });

    if (user === null) {
      user = await this.usersRepository.save({ username: loginUser.username });
    }

    return this.authService.signJWT(user, aud);
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    const dataToUpdate: Partial<User> = { ...updateUserDto };
    await this.usersRepository.update(uid, dataToUpdate);
    return this.usersRepository.findOne(uid);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/User.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(uid: number, options = {}) {
    return await this.usersRepository.findOne(uid, options);
  }

  async updateUsername(
    uid: number,
    username: string,
  ): Promise<{ success: boolean; reason: string; user: User }> {
    const isAlreadyExists = await this.usersRepository.findOne({ username });

    if (isAlreadyExists) {
      return { success: false, reason: 'Username already exists', user: null };
    }

    const user = await this.usersRepository.findOne(uid);
    if (user.username !== '') {
      return {
        success: false,
        reason: 'User already has a username',
        user: null,
      };
    }

    await this.usersRepository.update(uid, { username });
    return {
      success: true,
      reason: 'Update username completed',
      user: await this.usersRepository.findOne(uid),
    };
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    return this.usersRepository.findOne(uid);
  }

  async save(saveParams = {}): Promise<User> {
    return await this.usersRepository.save(saveParams);
  }
}

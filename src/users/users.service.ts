import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { platform } from 'os';
import { Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { User } from '../entities/User.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly accountsService: AccountsService,
  ) {}

  async findOne(uid: number, options = {}) {
    return await this.usersRepository.findOne(uid, options);
  }

  async updateUsername(uid: number, username: string): Promise<User> {
    const user = await this.usersRepository.findOne(uid);
    // only modify the username when it's empty
    user.username = user.username || username;

    return await this.usersRepository.save(user);
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

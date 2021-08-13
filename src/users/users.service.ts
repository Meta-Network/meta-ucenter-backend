import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import Events from '../events';
import { Between, Like, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findOne(uid: number, options = {}) {
    return await this.usersRepository.findOne(uid, options);
  }

  async search(
    params: Partial<User>,
    options,
  ): Promise<{ result: User[]; total: number }> {
    const searches = Object.keys(params).map((key) => ({
      [key]: Like(`%${params[key]}%`),
    }));
    const [result, total] = await this.usersRepository.findAndCount({
      where: searches,
      ...options,
    });

    return { result, total };
  }

  async updateUsername(uid: number, username: string): Promise<User> {
    const isAlreadyExists = await this.usersRepository.findOne({ username });

    if (isAlreadyExists) {
      throw new BadRequestException('Username already exists.');
    }

    const user = await this.usersRepository.findOne(uid);
    if (user.username !== '') {
      throw new BadRequestException('User already has a username');
    }

    await this.usersRepository.update(uid, { username });
    const updatedUser = await this.usersRepository.findOne(uid);

    this.eventEmitter.emit(Events.UserProfileModified, updatedUser);
    return updatedUser;
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    const updatedUser = await this.usersRepository.findOne(uid);

    this.eventEmitter.emit(Events.UserProfileModified, updatedUser);
    return updatedUser;
  }

  async save(saveParams = {}): Promise<User> {
    return await this.usersRepository.save(saveParams);
  }

  async fetchUsers(min: number, max: number) {
    return this.usersRepository.find({ where: { id: Between(min, max) } });
  }
}

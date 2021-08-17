import { User } from 'src/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, MoreThan, Repository } from 'typeorm';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateUserDto } from './dto/update-user.dto';
import Events from '../events';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
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
    this.logger.log('emit Event UserProfileModified', updatedUser);
    this.eventEmitter.emit(Events.UserProfileModified, updatedUser);
    return updatedUser;
  }

  async save(saveParams = {}): Promise<User> {
    return await this.usersRepository.save(saveParams);
  }

  async fetchUsers(queries: {
    userIdMin?: number;
    userIdMax?: number;
    modifiedAfter?: Date;
  }) {
    const { userIdMin, userIdMax, modifiedAfter } = queries;
    const result = new MetaInternalResult({ serviceCode: ServiceCode.UCENTER });

    if (userIdMin && userIdMax) {
      result.data = this.usersRepository.find({
        where: { id: Between(userIdMin, userIdMax) },
      });
    } else if (modifiedAfter) {
      result.data = this.usersRepository.find({
        where: { updated_at: MoreThan(modifiedAfter) },
      });
    } else {
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = 'Query conditions not found.';
    }

    return result;
  }
}

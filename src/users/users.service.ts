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
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async validateUsername(username: string): Promise<{ isExists: boolean }> {
    return {
      isExists: Boolean(await this.usersRepository.findOne({ username })),
    };
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
    return await this.usersRepository.findOne(uid);
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    return await this.usersRepository.findOne(uid);
  }

  async save(saveParams = {}): Promise<User> {
    return await this.usersRepository.save(saveParams);
  }

  async fetchUsers(queries: {
    userIdMin?: number;
    userIdMax?: number;
    modifiedAfter?: Date;
  }): Promise<MetaInternalResult<(User & { inviter_user_id: string })[]>> {
    this.logger.log('fetchUsers', queries);
    const { userIdMin, userIdMax, modifiedAfter } = queries;
    const result = new MetaInternalResult<User[]>({
      serviceCode: ServiceCode.UCENTER,
    });

    if (userIdMin && userIdMax) {
      result.data = await this.usersRepository.find({
        where: { id: Between(userIdMin, userIdMax) },
      });
    } else if (modifiedAfter) {
      result.data = await this.usersRepository.find({
        where: { updated_at: MoreThan(modifiedAfter) },
      });
    } else {
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = 'Query conditions not found.';
    }

    return result as MetaInternalResult<(User & { inviter_user_id: string })[]>;
  }
}

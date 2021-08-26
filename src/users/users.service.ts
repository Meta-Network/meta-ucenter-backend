import { Request } from 'express';
import { User } from 'src/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, MoreThan, Repository } from 'typeorm';
import {
  Injectable,
  Logger,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import Events from '../events';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '../config/config.service';
import rawbody from 'raw-body';
import crypto from 'crypto';
import fleekStorage from '@fleekhq/fleek-storage-js';
import path from 'path';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
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

  async uploadAvatar(uid: number, request: Request): Promise<any> {
    const name = request.headers['file-name'] as string;
    const file = await rawbody(request);

    const hashSum = crypto.createHash('sha256');
    hashSum.update(file);

    const hexName = hashSum.digest('hex');
    const fileName = hexName + path.parse(name).ext;

    const uploadResult = await fleekStorage.upload({
      apiKey: this.configService.get<string>('fleek.api_key'),
      apiSecret: this.configService.get<string>('fleek.api_secret'),
      key: fileName,
      data: file,
    });

    await this.usersRepository.update(uid, {
      avatar: uploadResult.publicUrl,
    });

    const updatedUser = await this.findOne(uid);

    this.logger.log('emit Event UserProfileModified', updatedUser);
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
  }): Promise<MetaInternalResult> {
    this.logger.log('fetchUsers', queries);
    const { userIdMin, userIdMax, modifiedAfter } = queries;
    const result = new MetaInternalResult({ serviceCode: ServiceCode.UCENTER });

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
    this.logger.debug(`fetchUsers result ${JSON.stringify(result)}`);
    return result;
  }
}

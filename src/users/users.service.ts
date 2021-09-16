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
import { InvitationService } from '../invitation/invitation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private invitationService: InvitationService,
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

  async validateUsername(username: string): Promise<{ isExists: boolean }> {
    const isAlreadyExists = await this.usersRepository.findOne({ username });
    let isExists = false;

    if (isAlreadyExists) {
      isExists = true;
    }

    return { isExists };
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

    const invitation = await this.invitationService.findOneBy({
      invitee_user_id: uid,
    });

    this.eventEmitter.emit(Events.UserProfileModified, {
      ...updatedUser,
      inviter_user_id: invitation.inviter_user_id,
    });
    return updatedUser;
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    const updatedUser = await this.usersRepository.findOne(uid);
    this.logger.log('emit Event UserProfileModified', updatedUser);
    const invitation = await this.invitationService.findOneBy({
      invitee_user_id: uid,
    });

    this.eventEmitter.emit(Events.UserProfileModified, {
      ...updatedUser,
      inviter_user_id: invitation.inviter_user_id,
    });

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

    if (result.data) {
      result.data = await Promise.all(
        result.data.map(async (user) => {
          const invitation = await this.invitationService.findOneBy({
            invitee_user_id: user.id,
          });

          return { ...user, inviter_user_id: invitation?.inviter_user_id || 0 };
        }),
      );
    }

    this.logger.debug(`fetchUsers result ${JSON.stringify(result)}`);
    return result;
  }
}

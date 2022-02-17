import { serialize } from 'v8';
import crypto, { createHash } from 'crypto';
import { ConfigService } from 'src/config/config.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, In, Repository } from 'typeorm';
import { Invitation } from 'src/entities/Invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';
import Events from '../events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserInvitationCountPayload } from '../type';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  private availableCountModified(owner: number): void {
    if (owner !== 0) {
      this.invitationRepository
        .count({
          where: {
            inviter_user_id: owner,
            invitee_user_id: 0, // only count invitations that haven't been used
          },
        })
        // no need to await for the event emmit
        .then((count: number) => {
          const payload: UserInvitationCountPayload = {
            userId: owner,
            count,
          };
          this.eventEmitter.emit(Events.UserInvitationCountUpdated, payload);
        });
    }
  }

  // Because we're handling the creation event in the createMultiple function,
  // so keep this as a private method keeps us simple to manage the functions.
  // If you're going to create only one invitation, call the createMultiple with count=1
  private async create(
    invitationDto: CreateInvitationDto,
  ): Promise<Invitation> {
    const now = new Date();

    const invitation: Partial<Invitation> = {
      ...invitationDto,
      salt: crypto.randomBytes(20).toString('hex'),
      invitee_user_id: 0,
      created_at: now,
      updated_at: now,
      issuer: this.configService.get<string>('jwt.issuer'),
    };

    // to always generate the same hash
    const payload: Partial<Invitation> = {
      id: invitation.id,
      salt: invitation.salt,
      inviter_user_id: invitation.inviter_user_id,
      created_at: invitation.created_at,
    };

    const signature = createHash('sha256')
      .update(serialize(payload))
      .digest('hex');

    return await this.invitationRepository.save({
      ...invitation,
      signature,
    });
  }

  async createMultiple(
    count: number,
    invitationDto: CreateInvitationDto,
  ): Promise<Invitation[]> {
    const invitations: Invitation[] = [];

    for (let i = 0; i < count; i++) {
      invitations.push(await this.create(invitationDto));
    }

    this.availableCountModified(invitationDto.inviter_user_id);
    return invitations;
  }

  async find(conditions: any): Promise<Invitation[]> {
    return await this.invitationRepository.find(conditions);
  }

  async findOne(conditions: any): Promise<Invitation> {
    return await this.invitationRepository.findOne(conditions);
  }

  async update(entity: Invitation): Promise<Invitation> {
    const modified = await this.invitationRepository.save(entity);
    this.availableCountModified(modified.inviter_user_id);
    return modified;
  }

  async updateMultiple(
    ids: number[],
    updateInvitationDto: UpdateInvitationDto,
  ): Promise<Invitation[]> {
    await getConnection()
      .createQueryBuilder()
      .update(Invitation)
      .set(updateInvitationDto)
      .where({ id: In(ids) })
      .execute();
    return await this.invitationRepository.find({
      where: { id: In(ids) },
    });
  }

  async updateMyInvitationMessage(
    uid: number,
    signature: string,
    updateInvitationDto: UpdateInvitationDto,
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({ signature });

    if (uid !== invitation.inviter_user_id) {
      throw new ForbiddenException(
        'You have no permission to update this invitation.',
      );
    }

    return await this.update(Object.assign(invitation, updateInvitationDto));
  }

  async validateInvitation(
    validateInvitationDto: ValidateInvitationDto,
  ): Promise<{ exists: boolean; available: boolean }> {
    let available = false;
    let exists = false;

    const invitation = await this.invitationRepository.findOne({
      signature: validateInvitationDto.invitation,
    });

    if (!invitation) {
      return { available, exists };
    } else {
      exists = true;
    }

    if (!invitation.invitee_user_id) {
      available = true;
    }

    return { available, exists };
  }
}

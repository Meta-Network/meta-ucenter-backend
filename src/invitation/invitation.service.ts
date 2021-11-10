import { serialize } from 'v8';
import crypto, { createHash } from 'crypto';
import { ConfigService } from 'src/config/config.service';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, In, Repository } from 'typeorm';
import { Invitation } from 'src/entities/Invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(InvitationService.name);

  async create(invitationDto: CreateInvitationDto): Promise<Invitation> {
    this.logger.log('handleNewInvitation', invitationDto);
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

    return await this.invitationRepository.save({ ...invitation, signature });
  }

  async createMultiple(
    numbers: number,
    invitationDto: CreateInvitationDto,
  ): Promise<Invitation[]> {
    this.logger.log('handleCreateMultipleInvitations', numbers, invitationDto);
    const invitations: Invitation[] = [];
    for (let i = 0; i < numbers; i++) {
      invitations.push(await this.create(invitationDto));
    }
    return invitations;
  }

  async find(conditions: any): Promise<Invitation[]> {
    return await this.invitationRepository.find(conditions);
  }

  async findOne(conditions: any): Promise<Invitation> {
    return await this.invitationRepository.findOne(conditions);
  }

  async update(entity: Invitation): Promise<Invitation> {
    return await this.invitationRepository.save(entity);
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

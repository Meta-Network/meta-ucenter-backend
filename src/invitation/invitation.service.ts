import { serialize } from 'v8';
import crypto, { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from 'src/entities/Invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(InvitationService.name);

  async createInvitation(invitationDto: CreateInvitationDto): Promise<string> {
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

    // to always build the same hash
    const payload: Partial<Invitation> = { ...invitation };
    delete payload.updated_at;
    delete payload.invitee_user_id;

    const signature = createHash('sha256')
      .update(serialize(payload))
      .digest('hex');

    await this.invitationRepository.save({ ...invitation, signature });
    return signature;
  }

  async findOne(signature: string): Promise<Invitation> {
    return await this.invitationRepository.findOne({ signature });
  }

  async findByInviterId(inviter_user_id: number): Promise<Invitation[]> {
    return await this.invitationRepository.find({ inviter_user_id });
  }

  async update(entity: Invitation): Promise<Invitation> {
    return await this.invitationRepository.save(entity);
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
}

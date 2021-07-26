import { serialize } from 'v8';
import crypto, { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from 'src/entities/Invitation.entity';
import { InvitationDto } from './dto/invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private configService: ConfigService,
  ) {}

  async createInvitation(invitationDto: InvitationDto): Promise<string> {
    const now = new Date();

    const invitation: Partial<Invitation> = {
      ...invitationDto,
      salt: crypto.randomBytes(20).toString('hex'),
      invitee_user_id: 0,
      created_at: now,
      updated_at: now,
      issuer: this.configService.get<string>('jwt.issuer'),
    };

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

  async update(entity: Invitation): Promise<Invitation> {
    return await this.invitationRepository.save(entity);
  }
}

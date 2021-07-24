import { serialize } from 'v8';
import crypto, { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createInvitation(invitationDto: InvitationDto): Promise<string> {
    const now = new Date();

    const payload: Partial<Invitation> = {
      ...invitationDto,
      salt: crypto.randomBytes(20).toString('hex'),
      invitee_user_id: 0,
      created_at: now,
      updated_at: now,
      issuer: this.configService.get<string>('jwt.issuer'),
    };

    const signature = createHash('sha256')
      .update(serialize(payload))
      .digest('hex');

    await this.invitationRepository.save({ ...payload, signature });
    return signature;
  }

  async getInvitation(signature: string): Promise<Invitation> {
    return await this.invitationRepository.findOne({ signature });
  }
}

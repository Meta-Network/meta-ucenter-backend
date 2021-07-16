import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/Account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}
  async findBy(searchParams: any, options = {}): Promise<Account> {
    return await this.accountsRepository.findOne(searchParams, options);
  }
  async save(saveParams: any): Promise<Account> {
    return await this.accountsRepository.save(saveParams);
  }
  async findOne(accountId: number): Promise<Account> {
    return await this.accountsRepository.findOne(accountId);
  }
}

import { EntityRepository, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Contract } from './contract.entity';

@EntityRepository(Contract)
export class ContractsRepository extends Repository<Contract> {
  private logger = new Logger('ContractsRepository', { timestamp: true });
}

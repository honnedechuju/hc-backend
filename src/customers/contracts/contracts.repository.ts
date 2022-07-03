import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Customer } from '../customer.entity';
import { Contract } from './contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';

@EntityRepository(Contract)
export class ContractsRepository extends Repository<Contract> {
  async createContract(
    createContractDto: CreateContractDto,
    customer: Customer,
  ): Promise<Contract> {
    const contract = this.create({
      ...createContractDto,
      customer,
    });
    try {
      await this.save(contract);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return contract;
  }
}

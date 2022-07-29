import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Customer } from '../customer.entity';
import { ContractStatus } from './contract-status.enum';
import { Contract } from './contract.entity';
import { ContractType } from './contract-type.enum';
import { Student } from '../students/student.entity';

@EntityRepository(Contract)
export class ContractsRepository extends Repository<Contract> {
  async createContract(
    contractType: ContractType,
    contractStatus: ContractStatus,
    lastPaymentTime: Date,
    nextPaymentTime: Date,
    stripeId: string,
    customer: Customer,
    students: Student[],
  ): Promise<Contract> {
    const contract = this.create({
      type: contractType,
      status: contractStatus,
      lastPaymentTime,
      nextPaymentTime,
      stripeSubscriptionId: stripeId,
      students,
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

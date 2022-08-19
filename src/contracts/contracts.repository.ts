import { NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Contract } from './contract.entity';

@EntityRepository(Contract)
export class ContractsRepository extends Repository<Contract> {
  async getContractByStripeSubscriptionId(stripeSubscriptionId: string) {
    const found = this.findOne({
      stripeSubscriptionId,
    });
    if (!found) {
      throw new NotFoundException(
        `Contract with stripeSubscriptionId "${stripeSubscriptionId}" not found`,
      );
    }
    return found;
  }
}

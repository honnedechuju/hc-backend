import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from 'src/customers/customer.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { GetContractsFilterDto } from './dto/get-contracts-filter.dto';

@EntityRepository(Contract)
export class ContractsRepository extends Repository<Contract> {
  private logger = new Logger(ContractsRepository.name, { timestamp: true });

  async getContracts(
    filterDto: GetContractsFilterDto,
    customer?: Customer,
  ): Promise<Contract[]> {
    const {
      createdAt,
      updatedAt,
      amount,
      status,
      lastPaymentTime,
      nextPaymentTime,
    } = filterDto;

    const query = this.createQueryBuilder('contract');

    if (customer) {
      query.andWhere({ customer });
    }

    if (createdAt) {
      query.andWhere('contract.createdAt = :createdAt', { createdAt });
    }

    if (updatedAt) {
      query.andWhere('contract.updatedAt = :updatedAt', {
        updatedAt,
      });
    }

    if (amount) {
      query.andWhere('contract.amount = :amount', { amount });
    }

    if (status) {
      query.andWhere('contract.status = :status', {
        status,
      });
    }

    if (lastPaymentTime) {
      query.andWhere('contract.lastPaymentTime = :lastPaymentTime', {
        lastPaymentTime,
      });
    }

    if (nextPaymentTime) {
      query.andWhere('contract.nextPaymentTime = :nextPaymentTime', {
        nextPaymentTime,
      });
    }

    query.orderBy('contract.createdAt', 'ASC');

    query.leftJoinAndSelect('contract.items', 'items');

    query.leftJoinAndSelect('contract.payments', 'payments');

    try {
      const contracts = await query.getMany();
      return contracts;
    } catch (error) {
      this.logger.error(
        `Failed to get contracts for customer "${JSON.stringify(
          customer,
        )}". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

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

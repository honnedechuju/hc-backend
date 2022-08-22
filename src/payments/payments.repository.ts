import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Student } from 'src/students/student.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Customer } from '../customers/customer.entity';
import { GetPaymentsFilterDto } from './dto/get-payments-filter.dto';
import { Payment } from './payment.entity';

@EntityRepository(Payment)
export class PaymentsRepository extends Repository<Payment> {
  private logger = new Logger(PaymentsRepository.name, { timestamp: true });

  async getPayments(
    filterDto: GetPaymentsFilterDto,
    student?: Student,
    contract?: Contract,
    customer?: Customer,
  ) {
    const { type } = filterDto;

    const query = this.createQueryBuilder('payment');

    if (student) {
      query.andWhere({ student });
    }

    if (type) {
      query.andWhere({ contract });
    }

    if (customer) {
      query.andWhere({ customer });
    }

    if (type) {
      query.andWhere({ type });
    }

    query.orderBy('contract.createdAt', 'ASC');

    query.leftJoinAndSelect('payment.student', 'student');

    query.leftJoinAndSelect('payment.contract', 'payments');

    query.leftJoinAndSelect('payment.customer', 'customer');

    try {
      const contracts = await query.getMany();
      return contracts;
    } catch (error) {
      this.logger.error(
        `Failed to get contracts for student "${JSON.stringify(
          student,
        )}", contract "${JSON.stringify(
          contract,
        )}", customer "${customer}". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createPayment(
    paidAt: Date,
    amount: number,
    paid: boolean,
    billingReason: string,
    stripeCustomerId: string,
    stripeChargeId: string,
    stripeInvoiceId: string,
    stripePaymentIntentId: string,
    stripeSubscriptionId: string,
    contract: Contract,
    student: Student,
    customer: Customer,
  ) {
    const payment = this.create({
      paidAt,
      amount,
      paid,
      billingReason,
      stripeCustomerId,
      stripeChargeId,
      stripeInvoiceId,
      stripePaymentIntentId,
      stripeSubscriptionId,
      contract,
      student,
      customer,
    });
    try {
      this.save(payment);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}

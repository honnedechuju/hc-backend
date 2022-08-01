import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { EntityRepository, Repository } from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Customer } from '../customer.entity';
import { Payment } from './payment.entity';

@EntityRepository(Payment)
export class PaymentsRepository extends Repository<Payment> {
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

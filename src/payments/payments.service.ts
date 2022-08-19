import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { ContractsRepository } from '../contracts/contracts.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentsRepository)
    private paymentsRepository: PaymentsRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(ContractsRepository)
    private contractsRepository: ContractsRepository,
  ) {}

  async createPaymentFromStripeInvoice(invoice: Stripe.Invoice) {
    const {
      id: stripeInvoiceId,
      amount_paid: amount,
      billing_reason: billingReason,
      created,
      paid,
    } = invoice;
    let {
      customer: stripeCustomerId,
      charge: stripeChargeId,
      payment_intent: stripePaymentIntentId,
      subscription: stripeSubscriptionId,
    } = invoice;

    const paidAt = new Date(created * 1000);
    if (typeof stripeCustomerId !== 'string') {
      stripeCustomerId = stripeCustomerId.id;
    }
    if (typeof stripeChargeId !== 'string') {
      stripeChargeId = stripeChargeId.id;
    }
    if (typeof stripePaymentIntentId !== 'string') {
      stripePaymentIntentId = stripePaymentIntentId.id;
    }
    if (typeof stripeSubscriptionId !== 'string') {
      stripeSubscriptionId = stripeSubscriptionId.id;
    }

    const contract = await this.contractsRepository.findOne({
      stripeSubscriptionId,
    });
    if (!contract) {
      throw new InternalServerErrorException();
    }
    const customer = await this.customersRepository.findOne({
      stripeCustomerId: stripeCustomerId,
    });
    if (!customer) {
      throw new InternalServerErrorException();
    }

    await this.paymentsRepository.createPayment(
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
    );
  }
}

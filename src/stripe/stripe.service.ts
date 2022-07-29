import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContractType } from '../customers/contracts/contract-type.enum';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_API_KEY'), {
      apiVersion: configService.get('STRIPE_API_VERSION'),
    });
  }

  async createCustomer(customerId: string, name: string, email: string) {
    return this.stripe.customers.create({
      description: customerId,
      name,
      email,
    });
  }

  async createSubscription(
    customerId: string,
    paymentMethodId: string,
    contractType: ContractType,
  ) {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Could not attach paymentMethod to Customer.`,
      );
    }

    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [
        { price: `STRIPE_PRICE_ID_${this.configService.get(contractType)}` },
      ],
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 7,
    });

    return subscription;
  }

  async changeSubscriptionTypeById(id: string, contractType: ContractType) {
    return this.stripe.subscriptions.update(id, {
      items: [
        {
          price: `STRIPE_PRICE_ID_${this.configService.get(contractType)}`,
        },
      ],
    });
  }

  async cancelSubscriptionById(id: string) {
    return this.stripe.subscriptions.del(id);
  }
}

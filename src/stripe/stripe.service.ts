import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { ContractsService } from '../contracts/contracts.service';
import { PaymentsService } from '../payments/payments.service';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private paymentsService: PaymentsService,
    @Inject(forwardRef(() => CustomersService))
    private customersService: CustomersService,
    @Inject(forwardRef(() => ContractsService))
    private contractsService: ContractsService,
  ) {
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

  async createPaymentMethodForSuccess() {
    return this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        exp_month: 12,
        exp_year: 2024,
        number: '4242424242424242',
        cvc: '333',
      },
    });
  }

  async createPaymentMethodForFailure() {
    return this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        exp_month: 12,
        exp_year: 2024,
        number: '4000000000000002',
        cvc: '333',
      },
    });
  }

  async createSubscription(
    stripeCustomerId: string,
    paymentMethodId: string,
    metadata: any,
    items: Stripe.SubscriptionCreateParams.Item[],
  ) {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Could not attach paymentMethod to Customer.`,
      );
    }

    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      metadata,
      items,
      expand: ['latest_invoice.payment_intent'],
      // trial_period_days: 3,
    });

    return subscription;
  }

  async payInvoiceById(invoiceId: string) {
    return this.stripe.invoices.pay(invoiceId);
  }

  async updateSubscriptionById(
    stripeSubscriptionId: string,
    params: Stripe.SubscriptionUpdateParams,
  ) {
    const subscription = await this.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    );

    if (params?.items) {
      const itemsToBeDeleted = subscription.items.data.map((item) => ({
        id: item.id,
        deleted: true,
      }));

      return this.stripe.subscriptions.update(stripeSubscriptionId, {
        ...params,
        items: [...itemsToBeDeleted, ...params.items],
      });
    }
    return this.stripe.subscriptions.update(stripeSubscriptionId, params);
  }

  async cancelSubscriptionById(id: string) {
    return this.stripe.subscriptions.del(id);
  }

  async getSubscriptionById(id: string) {
    return this.stripe.subscriptions.retrieve(id);
  }

  async getPaymentMethodsByCustomerId(stripeCustomerId: string) {
    return this.stripe.customers.listPaymentMethods(stripeCustomerId, {
      type: 'card',
    });
  }

  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    stripeCustomerId: string,
  ) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });
  }

  async detachPaymentMethodFromCustomer(paymentMethodId: string) {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async updatePaymentMethodOfSubscription(
    stripeSubscriptionId: string,
    paymentMethodId: string,
  ) {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      default_payment_method: paymentMethodId,
    });
  }

  async handleWebhook(request: Request, response: Response) {
    const WEB_HOOK_SECRET =
      'whsec_f86e75168f21fd54e3e1aec0462fd8985e496338618a5b4c1ca8a0a99b22d822';
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        request['rawBody'],
        request.headers['stripe-signature'],
        WEB_HOOK_SECRET,
      );
      response.status(200).send({ received: true });
    } catch (error) {
      console.log(error);
      return response.status(400).send();
    }
    if (event.object !== 'event') {
      throw new BadRequestException('You cannot access this url.');
    }
    console.log('きたEvent', event);
    switch (event.type) {
      case 'invoice.paid':
        const paidInvoice = event.data.object as Stripe.Invoice;
        await this.paymentsService.createPaymentFromStripeInvoice(paidInvoice);
        await this.contractsService.updateContractFromStripeInvoice(
          paidInvoice,
        );
        break;

      case 'invoice.payment_failed':
        const paymentFailedInvoice = event.data.object as Stripe.Invoice;
        await this.contractsService.updateContractFromStripeInvoice(
          paymentFailedInvoice,
        );
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await this.contractsService.checkCanceledContractByStripeSubscription(
          deletedSubscription,
        );
    }
  }
}

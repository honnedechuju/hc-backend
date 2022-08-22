import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Contract } from 'src/contracts/contract.entity';
import { ContractsService } from 'src/contracts/contracts.service';
import { Customer } from 'src/customers/customer.entity';
import { CustomersService } from 'src/customers/customers.service';
import { Student } from 'src/students/student.entity';
import { StudentsService } from 'src/students/students.service';
import Stripe from 'stripe';
import { ContractsRepository } from '../contracts/contracts.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { GetPaymentsFilterDto } from './dto/get-payments-filter.dto';
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
    @Inject(forwardRef(() => CustomersService))
    private customersService: CustomersService,
    @Inject(forwardRef(() => StudentsService))
    private studentsService: StudentsService,
    @Inject(forwardRef(() => ContractsService))
    private contractsService: ContractsService,
  ) {}

  async getPayments(filterDto: GetPaymentsFilterDto, user?: User) {
    const { customerId, studentId, contractId } = filterDto;
    let student: Student, contract: Contract, customer: Customer;
    if (studentId) {
      student = await this.studentsService.getStudentById(studentId, user);
    }
    if (contractId) {
      contract = await this.contractsService.getContractById(contractId, user);
    }
    if (customerId) {
      customer = await this.customersService.getCustomerById(customerId, user);
    }
    return this.paymentsRepository.getPayments(
      filterDto,
      student,
      contract,
      customer,
    );
  }

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

    const contract =
      await this.contractsService.getContractByStripeSubscriptionId(
        stripeSubscriptionId,
      );
    const customer = await this.customersService.getCustomerByStripeCustomerId(
      stripeCustomerId,
    );

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
      contract.student,
      customer,
    );
  }
}

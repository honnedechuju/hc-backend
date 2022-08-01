import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { User } from 'src/auth/user.entity';
import { StripeService } from 'src/stripe/stripe.service';
import Stripe from 'stripe';
import { CustomersRepository } from '../customers.repository';
import { Student } from '../students/student.entity';
import { StudentsRepository } from '../students/students.repository';
import { StudentsService } from '../students/students.service';
import { ContractStatus } from './contract-status.enum';
import { ContractType } from './contract-type.enum';
import { Contract } from './contract.entity';
import { ContractsRepository } from './contracts.repository';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(ContractsRepository)
    private contractsRepository: ContractsRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,
    private studentsService: StudentsService,
    @Inject(forwardRef(() => StripeService))
    private stripeService: StripeService,
  ) {}

  async getContracts(user: User): Promise<Contract[]> {
    const customer = await this.customersRepository.findOne({ user });
    if (user.role === UserRole.ADMIN) {
      return this.contractsRepository.find();
    } else {
      return this.contractsRepository.find({ customer });
    }
  }

  async createContract(
    createContractDto: CreateContractDto,
    user: User,
  ): Promise<void> {
    const customer = await this.customersRepository.findOne({ user });
    const { studentIds, paymentMethodId, contractType } = createContractDto;

    // checking student ids and retrieving all students data
    await this.studentsService.checkCustomerStudents(studentIds, user);
    const students = await Promise.all(
      studentIds.map((id) => this.studentsService.getStudentById(id, user)),
    );

    const subscription = await this.stripeService.createSubscription(
      customer.stripeCustomerId,
      paymentMethodId,
      contractType,
      studentIds,
    );
    const { id, status, current_period_start, current_period_end } =
      subscription;
    const stripeSubscriptionId = id;
    const lastPaymentTime = new Date(current_period_start * 1000);
    const nextPaymentTime = new Date(current_period_end * 1000);
    const contractStatus =
      this.getContractStatusFromStripeSubscriptionStatus(status);

    await this.contractsRepository.createContract(
      contractType,
      contractStatus,
      lastPaymentTime,
      nextPaymentTime,
      stripeSubscriptionId,
      customer,
      students,
    );
  }

  async getContractById(id: string, user: User): Promise<Contract> {
    if (user.role === UserRole.ADMIN) {
      const found = await this.contractsRepository.findOne({ id });
      if (!found) {
        throw new NotFoundException();
      }
      return found;
    }
    const customer = await this.customersRepository.findOne({ user });

    const found = await this.contractsRepository.findOne({ id, customer });
    if (!found) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }
    return found;
  }

  async updateContractById(
    id: string,
    updateContractDto: UpdateContractDto,
    user: User,
  ): Promise<void> {
    const found = await this.getContractById(id, user);
    if (updateContractDto.type && updateContractDto.type !== found.type) {
      try {
        const response = await this.stripeService.changeSubscriptionTypeById(
          found.stripeSubscriptionId,
          updateContractDto.type,
        );
        console.log(response);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          `Contract with ID "${id} couldn't be modified`,
        );
      }
    }
    await this.contractsRepository.save({ ...found, ...updateContractDto });
  }

  async cancelContractById(contractId: string, user: User) {
    const found = await this.getContractById(contractId, user);
    let deletedSubscription;
    try {
      deletedSubscription = await this.stripeService.cancelSubscriptionById(
        found.stripeSubscriptionId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Contract with ID "${contractId} couldn't be canceled"`,
      );
    }
    if (deletedSubscription.status !== 'canceled') {
      throw new InternalServerErrorException(
        `Contract with ID "${contractId} couldn't be canceled"`,
      );
    }
    this.updateContractById(
      contractId,
      {
        status: ContractStatus.CANCELED,
      },
      user,
    );
  }

  async checkCreatedContractByStripeSubscription(
    stripeSubscription: Stripe.Subscription,
  ) {
    const contract =
      await this.contractsRepository.getContractByStripeSubscriptionId(
        stripeSubscription.id,
      );
    // いずれ実装する
  }

  async checkUpdatedContractByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ) {
    this.contractsRepository.getContractByStripeSubscriptionId(
      stripeSubscriptionId,
    );
  }

  async checkFailedContractByStripeSubscriptionId(
    stripeSubscription: Stripe.Subscription,
  ) {
    const found =
      await this.contractsRepository.getContractByStripeSubscriptionId(
        stripeSubscription.id,
      );
  }

  async checkCanceledContractByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ) {
    const found =
      await this.contractsRepository.getContractByStripeSubscriptionId(
        stripeSubscriptionId,
      );
    if (found.status !== ContractStatus.CANCELED) {
      console.error(
        `ContractsRepository and Stripe server are inconsistent.\nTrying to update...`,
      );
      found.status = ContractStatus.CANCELED;
      try {
        await this.contractsRepository.save(found);
      } catch (error) {
        console.error(
          `Could not cancel Contract: ${found}. \nContractsRepository and Stripe server are still inconsistent.`,
        );
      }
      console.log(`Update is successfully accomplished.`);
    }
  }

  async updateContractFromStripeInvoice(stripeInvoice: Stripe.Invoice) {
    let stripeSubscriptionId: string;
    if (typeof stripeInvoice.subscription === 'string') {
      stripeSubscriptionId = stripeInvoice.subscription;
    } else {
      stripeSubscriptionId = stripeInvoice.subscription.id;
    }
    const subscription = await this.stripeService.getSubscriptionById(
      stripeSubscriptionId,
    );

    await this.updateContractFromStripeSubscription(subscription);
  }

  async updateContractFromStripeSubscription(
    subscription: Stripe.Subscription,
  ) {
    const contract =
      await this.contractsRepository.getContractByStripeSubscriptionId(
        subscription.id,
      );
    const { status, current_period_start, current_period_end, items } =
      subscription;
    const contractStatus =
      this.getContractStatusFromStripeSubscriptionStatus(status);
    contract.status = contractStatus;
    contract.lastPaymentTime = new Date(current_period_start * 1000);
    contract.nextPaymentTime = new Date(current_period_end * 1000);

    const stripeSubscriptionContractType =
      this.getContractTypeFromStripePriceId(items.data[0].price.id);
    if (stripeSubscriptionContractType !== contract.type) {
      console.error(
        'Stripe Subscription Contract type and Contract type are different.',
      );
      console.error('Please Check Stripe and Contract Repository');
      console.error(`Stripe Subscription ID "${subscription.id}"`);
      contract.type = stripeSubscriptionContractType;
    }

    const stripeStudentIds: string[] = [];
    items.data.map((item) => {
      stripeStudentIds.push(item.metadata['student_id']);
    });
    const contractStudents = await Promise.resolve(contract.students);
    const contractStudentIds = contractStudents.map((student) => student.id);
    if (
      stripeStudentIds.sort().join(',') !== contractStudentIds.sort().join(',')
    ) {
      console.error(
        'Stripe Subscriptiono StudentIds and Contract StudentIds are different.',
      );
      console.error('Please Check Stripe and Contract Repository');
      console.error(`Stripe Subscription ID "${subscription.id}"`);
      contract.students = await Promise.all(
        stripeStudentIds.map((id) => this.studentsRepository.findOne(id)),
      );
    }

    await this.contractsRepository.save(contract);
  }

  getContractStatusFromStripeSubscriptionStatus(
    stripeSubscriptionStatus: Stripe.Subscription.Status,
  ): ContractStatus {
    switch (stripeSubscriptionStatus) {
      case 'trialing':
        return ContractStatus.TRIAL;
      case 'active':
        return ContractStatus.SETTLED;
      case 'canceled':
        return ContractStatus.CANCELED;
      default:
        return ContractStatus.NOTPAID;
    }
  }

  getContractTypeFromStripePriceId(stripePriceId: string) {
    switch (stripePriceId) {
      case this.configService.get(`STRIPE_PRICE_ID_${ContractType.LIMITED}`):
        return ContractType.LIMITED;
      case this.configService.get(`STRIPE_PRICE_ID_${ContractType.UNLIMITED}`):
        return ContractType.UNLIMITED;
      case this.configService.get(`STRIPE_PRICE_ID_${ContractType.TUTOR}`):
        return ContractType.TUTOR;
      default:
        throw new NotFoundException(
          `Stripe Price ID with "${stripePriceId}" not found.`,
        );
    }
  }
}

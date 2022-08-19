import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../auth/permission.enum';
import Stripe from 'stripe';

import { Role } from '../auth/role.enum';
import { User } from '../auth/user.entity';
import { UsersRepository } from '../auth/users.repository';
import { StripeService } from '../stripe/stripe.service';
import { CustomersRepository } from '../customers/customers.repository';
import { StudentsRepository } from '../students/students.repository';
import { StudentsService } from '../students/students.service';
import { ContractStatus } from './contract-status.enum';
import { ContractType } from './contract-type.enum';
import { Contract } from './contract.entity';
import { ContractsRepository } from './contracts.repository';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ItemType } from './item/item-type.enum';
import { ItemsRepository } from './item/items.repository';
import { ItemsService } from './item/items.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    @InjectRepository(ContractsRepository)
    private contractsRepository: ContractsRepository,
    @InjectRepository(ItemsRepository)
    private itemsRepository: ItemsRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,

    private configService: ConfigService,
    private studentsService: StudentsService,
    private itemsService: ItemsService,
    @Inject(forwardRef(() => StripeService))
    private stripeService: StripeService,
  ) {}

  async getContracts(user: User): Promise<Contract[]> {
    const customer = await this.customersRepository.findOne({ user });
    if (user.role === Role.ADMIN) {
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
    const { paymentMethodId, items: createItemsDto } = createContractDto;

    // checking student ids and retrieving all students data
    const studentIds = createItemsDto.map(
      (createItemDto) => createItemDto.studentId,
    );
    await this.studentsService.checkCustomerStudents(studentIds, user);

    // creating Items
    const items = await Promise.all(
      createItemsDto.map(async (createItemDto) => {
        const student = await this.studentsService.getStudentById(
          createItemDto.studentId,
          user,
        );
        return this.itemsService.createItem(createItemDto.type, student);
      }),
    );

    // creating Contract
    const amount = items.reduce(
      (sum, current) => sum + Number(current.price),
      0,
    );
    const contract = this.contractsRepository.create({
      amount,
      items,
      customer,
    });

    // creating Stripe subscription
    const itemsParams =
      this.itemsService.getStripeSubscriptionCreateParamsItem(items);

    const metadata = {
      contract_id: contract.id,
    };

    const subscription = await this.stripeService.createSubscription(
      customer.stripeCustomerId,
      paymentMethodId,
      metadata,
      itemsParams,
    );

    // saving contract
    const {
      id,
      status,
      current_period_start,
      current_period_end,
      items: stripeItems,
    } = subscription;
    contract.stripeSubscriptionId = id;
    contract.lastPaymentTime = new Date(current_period_start * 1000);
    contract.nextPaymentTime = new Date(current_period_end * 1000);
    contract.status =
      this.getContractStatusFromStripeSubscriptionStatus(status);
    const savedContract = await this.contractsRepository.save(contract);

    // saving items
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        item.contract = savedContract;
        return await this.itemsRepository.save(item);
      }),
    );
    await this.itemsService.saveItemsFromStripeItems(updatedItems, stripeItems);
  }

  async getContractById(id: string, user: User): Promise<Contract> {
    if (user.role === Role.ADMIN) {
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
    const customer = await this.customersRepository.findOne({ user });
    const found = await this.getContractById(id, user);

    let params: Stripe.SubscriptionUpdateParams;

    if (updateContractDto?.paymentMethodId) {
      const { paymentMethodId } = updateContractDto;
      const paymentMethods =
        await this.stripeService.getPaymentMethodsByCustomerId(
          customer.stripeCustomerId,
        );
      const paymentMethodIds = paymentMethods.data.map(
        (paymentMethod) => paymentMethod.id,
      );
      if (!paymentMethodIds.includes(paymentMethodId)) {
        await this.stripeService.attachPaymentMethodToCustomer(
          paymentMethodId,
          customer.stripeCustomerId,
        );
      }
      params.default_payment_method = paymentMethodId;
    }

    if (updateContractDto?.items) {
      const { items: createItemsDto } = updateContractDto;
      const items = await Promise.all(
        createItemsDto.map(async (createItemDto) => {
          const student = await this.studentsService.getStudentById(
            createItemDto.studentId,
            user,
          );
          return this.itemsService.createItem(createItemDto.type, student);
        }),
      );
      params.items =
        this.itemsService.getStripeSubscriptionCreateParamsItem(items);

      // update contract.items
      found.items = items;
      await this.contractsRepository.save(found);
    }

    let subscription: Stripe.Response<Stripe.Subscription>;

    if (params) {
      subscription = await this.stripeService.updateSubscriptionById(
        found.stripeSubscriptionId,
        params,
      );
    } else {
      subscription = await this.stripeService.getSubscriptionById(
        found.stripeSubscriptionId,
      );
    }

    // retry to pay subscription invoice
    if (updateContractDto.pay) {
      if (typeof subscription.latest_invoice === 'string') {
        await this.stripeService.payInvoiceById(subscription.latest_invoice);
      } else {
        await this.stripeService.payInvoiceById(subscription.latest_invoice.id);
      }
    }
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
    found.status = ContractStatus.CANCELED;
    await this.contractsRepository.save(found);
  }

  async updateContractFromStripeSubscription(
    subscription: Stripe.Subscription,
  ) {
    const contract =
      await this.contractsRepository.getContractByStripeSubscriptionId(
        subscription.id,
      );
    const {
      status,
      items: stripeItems,
      current_period_start,
      current_period_end,
    } = subscription;
    contract.lastPaymentTime = new Date(current_period_start * 1000);
    contract.nextPaymentTime = new Date(current_period_end * 1000);
    contract.status =
      this.getContractStatusFromStripeSubscriptionStatus(status);
    const items = await Promise.all(
      stripeItems.data.map((stripeItem) => {
        return this.itemsRepository.findOne(stripeItem.metadata['item_id']);
      }),
    );
    contract.items = await this.itemsService.saveItemsFromStripeItems(
      items,
      stripeItems,
    );
    await this.contractsRepository.save(contract);
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

  async updateUserPermissionsFromContracts(user: User) {
    const customer = await this.customersRepository.findOne({ user });
    const contracts = await this.contractsRepository.find({ customer });
    const permissions: Permission[] = [];
    for (const contract of contracts) {
      if (
        contract.status === ContractStatus.SETTLED ||
        contract.status === ContractStatus.TRIAL
      ) {
        for (const item of contract.items) {
          this.getUserPermissionsFromItemType(item.type).map((permission) => {
            if (!permissions.includes(permission)) {
              permissions.push(permission);
            }
          });
        }
      }
    }
    user.permissions = permissions;
    await this.usersRepository.save(user);
  }

  // helper functions

  getUserPermissionsFromItemType(item: ItemType) {
    switch (item) {
      case ItemType.LIMITED:
        return [Permission.QUESTION];
      case ItemType.UNLIMITED:
        return [Permission.QUESTION];
      case ItemType.TUTOR:
        return [Permission.QUESTION];
      default:
        return [];
    }
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

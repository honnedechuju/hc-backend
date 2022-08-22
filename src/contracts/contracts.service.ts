import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../auth/permission.enum';
import Stripe from 'stripe';

import { User } from '../auth/user.entity';
import { UsersRepository } from '../auth/users.repository';
import { StripeService } from '../stripe/stripe.service';
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
import { GetContractsFilterDto } from './dto/get-contracts-filter.dto';
import { Connection } from 'typeorm';
import { Customer } from 'src/customers/customer.entity';
import { CustomersService } from 'src/customers/customers.service';
import { ItemStatus } from './item/item-status.enum';
import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    @InjectRepository(ContractsRepository)
    private contractsRepository: ContractsRepository,
    @InjectRepository(ItemsRepository)
    private itemsRepository: ItemsRepository,

    private configService: ConfigService,
    private studentsService: StudentsService,
    private itemsService: ItemsService,
    private paymentsService: PaymentsService,
    @Inject(forwardRef(() => CustomersService))
    private customersService: CustomersService,
    @Inject(forwardRef(() => StripeService))
    private stripeService: StripeService,

    private connection: Connection,
  ) {}

  async getContracts(
    filterDto: GetContractsFilterDto,
    user?: User,
  ): Promise<Contract[]> {
    if (!user) {
      const { customerId } = filterDto;
      if (!customerId) {
        throw new NotAcceptableException();
      } else {
        const customer = await this.customersService.getCustomerById(
          customerId,
        );
        return this.contractsRepository.getContracts(filterDto, customer);
      }
    } else {
      return this.contractsRepository.getContracts(filterDto, user.customer);
    }
  }

  async createContract(
    createContractDto: CreateContractDto,
    user?: User,
  ): Promise<void> {
    let customer: Customer;
    if (!user) {
      if (!createContractDto?.customerId) {
        throw new BadRequestException();
      }
      customer = await this.customersService.getCustomerById(
        createContractDto?.customerId,
      );
    } else {
      customer = user.customer;
    }

    const {
      paymentMethodId,
      studentId,
      items: createItemsDto,
    } = createContractDto;

    // checking student id and retrieving student data
    const student = await this.studentsService.getStudentById(studentId, user);

    // check double contract
    /* Only one contract can be settled per students */
    const contracts = await this.getContracts(
      {
        customerId: customer.id,
        status: ContractStatus.SETTLED,
      },
      user,
    );
    if (contracts.length !== 0) {
      throw new BadRequestException(
        `Student with ID "${studentId}" already has contract`,
      );
    }

    // creating Items(not saved)
    const items = createItemsDto.map((createItemDto) => {
      return this.itemsService.createItem(createItemDto.type, student);
    });

    // creating Contract(not saved)
    const amount = items.reduce(
      (sum, current) => sum + Number(current.price),
      0,
    );
    const contract = this.contractsRepository.create({
      amount,
      items,
      customer,
      student,
    });

    // start transaction

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // saving items
      const savedItems = await queryRunner.manager.save(items);

      // saving contract
      const savedContract = await queryRunner.manager.save(contract);

      // creating Stripe subscription
      const metadata = {
        contract_id: contract.id,
        customer_id: customer.id,
        student_id: student.id,
      };
      const itemsParams =
        this.itemsService.getStripeSubscriptionCreateParamsItems(savedItems);

      const subscription = await this.stripeService.createSubscription(
        customer.stripeCustomerId,
        paymentMethodId,
        metadata,
        itemsParams,
      );

      // updateContractProps
      const updatedContractFromStripe =
        this.updateContractPropsFromStripeSubscription(
          savedContract,
          subscription,
        );
      const savedContractFromStripe = await queryRunner.manager.save(
        updatedContractFromStripe,
      );

      // saving items
      const { items: stripeItems } = subscription;
      const itemsWithContract = items.map((item) => {
        item.contract = savedContractFromStripe;
        return item;
      });
      const itemsWithStripeInfo =
        this.itemsService.getUpdatedItemsFromStripeItems(
          itemsWithContract,
          stripeItems,
        );
      await queryRunner.manager.save(itemsWithStripeInfo);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async getContractById(id: string, user?: User): Promise<Contract> {
    const found = await this.contractsRepository.findOne({
      id,
    });
    if (!found) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }
    if (user && found.customer.id !== user.customer.id) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }
    return found;
  }

  async getContractByStripeSubscriptionId(
    stripeSubscriptionId: string,
    user?: User,
  ) {
    const found = await this.contractsRepository.findOne({
      stripeSubscriptionId,
      customer: user.customer,
    });
    if (!found) {
      throw new NotFoundException(
        `Contract with stripe subscription ID "${stripeSubscriptionId}" not found`,
      );
    }

    return found;
  }

  async updateContractById(
    id: string,
    updateContractDto: UpdateContractDto,
    user?: User,
  ): Promise<void> {
    let customer: Customer;
    if (!user) {
      if (!updateContractDto?.customerId) {
        throw new BadRequestException();
      }
      customer = await this.customersService.getCustomerById(
        updateContractDto.customerId,
      );
    } else {
      customer = user.customer;
    }
    const contract = await this.getContractById(id, user);
    delete updateContractDto?.customerId;

    const { paymentMethodId, items } = updateContractDto;

    if (paymentMethodId) {
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
      const params: Stripe.SubscriptionUpdateParams = {};
      params.default_payment_method = paymentMethodId;
      await this.stripeService.updateSubscriptionById(
        contract.stripeSubscriptionId,
        params,
      );
    }

    if (items) {
      const itemsToBeCreated = items.map((createItemDto) => {
        return this.itemsService.createItem(
          createItemDto.type,
          contract.student,
        );
      });

      const oldItems = await this.itemsService.getItems(
        { contractId: contract.id },
        user,
      );

      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const createdItems = await queryRunner.manager.save(itemsToBeCreated);
        const params: Stripe.SubscriptionUpdateParams = {
          items:
            this.itemsService.getStripeSubscriptionCreateParamsItems(
              createdItems,
            ),
        };

        const subscription = await this.stripeService.updateSubscriptionById(
          contract.stripeSubscriptionId,
          params,
        );

        // update old items status to detached
        const savedDetachedItems = await Promise.all(
          oldItems.map(async (item) => {
            item.status = ItemStatus.DETACHED;
            return await queryRunner.manager.save(item);
          }),
        );

        // updateContractProps
        const updatedContractFromStripe =
          this.updateContractPropsFromStripeSubscription(
            contract,
            subscription,
          );
        const savedContractFromStripe = await queryRunner.manager.save(
          updatedContractFromStripe,
        );

        // saving items
        const { items: stripeItems } = subscription;
        const itemsWithContract = createdItems.map((item) => {
          item.contract = savedContractFromStripe;
          return item;
        });
        const itemsWithStripeInfo =
          this.itemsService.getUpdatedItemsFromStripeItems(
            itemsWithContract,
            stripeItems,
          );
        const savedItemsWithStripeInfo = await queryRunner.manager.save(
          itemsWithStripeInfo,
        );

        // update contract.items
        contract.items = [...savedDetachedItems, ...savedItemsWithStripeInfo];
        await queryRunner.manager.save(contract);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.log(error);
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    }

    const subscription = await this.stripeService.getSubscriptionById(
      contract.stripeSubscriptionId,
    );

    if (
      subscription.status !== 'active' &&
      subscription.status !== 'trialing'
    ) {
      try {
        if (typeof subscription.latest_invoice === 'string') {
          await this.stripeService.payInvoiceById(subscription.latest_invoice);
        } else {
          await this.stripeService.payInvoiceById(
            subscription.latest_invoice.id,
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async cancelContractById(contractId: string, user?: User) {
    const contract = await this.getContractById(contractId, user);
    let deletedSubscription: Stripe.Response<Stripe.Subscription>;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      deletedSubscription = await this.stripeService.cancelSubscriptionById(
        contract.stripeSubscriptionId,
      );
      if (deletedSubscription.status !== 'canceled') {
        throw new InternalServerErrorException(
          `Contract with ID "${contractId} couldn't be canceled becauseof Stripe ServerError"`,
        );
      }
      contract.status = ContractStatus.CANCELED;
      await queryRunner.manager.save(contract);

      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Contract with ID "${contractId} couldn't be canceled"`,
      );
    } finally {
      queryRunner.release();
    }
  }

  async getItemsByContractId(contractId: string, user?: User) {
    return this.itemsService.getItems({ contractId }, user);
  }

  async getPaymentsByContractId(contractId: string, user?: User) {
    return this.paymentsService.getPayments({ contractId }, user);
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
    contract.items = await this.itemsService.getUpdatedItemsFromStripeItems(
      items,
      stripeItems,
    );
    await this.contractsRepository.save(contract);
  }

  async checkCanceledContractByStripeSubscription(
    stripeSubscription: Stripe.Subscription,
  ) {
    const found =
      await this.contractsRepository.getContractByStripeSubscriptionId(
        stripeSubscription.id,
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
    const contracts = await this.getContracts(null, user);
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

  updateContractPropsFromStripeSubscription(
    contract: Contract,
    subscription: Stripe.Response<Stripe.Subscription>,
  ) {
    const { id, status, current_period_start, current_period_end } =
      subscription;
    contract.stripeSubscriptionId = id;
    contract.lastPaymentTime = new Date(current_period_start * 1000);
    contract.nextPaymentTime = new Date(current_period_end * 1000);
    contract.status =
      this.getContractStatusFromStripeSubscriptionStatus(status);
    return contract;
  }

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

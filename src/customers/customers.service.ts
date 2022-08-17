import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../auth/role.enum';
import { StripeService } from '../stripe/stripe.service';
import { User } from '../auth/user.entity';
import { Customer } from './customer.entity';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { Connection } from 'typeorm';
import { CreatePaymentMethodDto } from './contracts/dto/create-payment-method.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    private stripeService: StripeService,
    private connection: Connection,
  ) {}

  async getCustomer(user: User): Promise<Customer | Customer[]> {
    if (user.role === Role.ADMIN) {
      return this.customersRepository.find();
    }
    return this.customersRepository.findOne({
      where: {
        user,
      },
    });
  }

  async getCustomerFromUser(user: User): Promise<Customer> {
    return this.customersRepository.findOne({
      user,
    });
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
    user: User,
  ): Promise<void> {
    const found = await this.customersRepository.findOne({ user });
    if (found) {
      throw new BadRequestException('Customer is already registered.');
    }

    const customer = this.customersRepository.create({
      ...createCustomerDto,
      user,
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const response = await this.stripeService.createCustomer(
        customer.id,
        customer.firstName + customer.lastName,
        user.email,
      );
      customer.stripeCustomerId = response.id;
      await queryRunner.manager.save(customer);
      user.role = Role.CUSTOMER;
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerById(id: string, user: User): Promise<Customer> {
    const where: { id: string; user?: User } = { id };
    if (user.role !== Role.ADMIN) {
      where.user = user;
    }
    const found = await this.customersRepository.findOne({ where });

    if (!found) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return found;
  }

  async updateCustomerById(
    id: string,
    updateCustomerByDto: UpdateCustomerDto,
    user: User,
  ): Promise<void> {
    const found = await this.getCustomerById(id, user);
    const customer: Customer = this.customersRepository.create({
      ...found,
      ...updateCustomerByDto,
    });
    try {
      await this.customersRepository.save(customer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getPaymentMethods(customerId: string, user: User) {
    const customer = await this.getCustomerById(customerId, user);
    return this.stripeService.getPaymentMethodsByCustomerId(
      customer.stripeCustomerId,
    );
  }

  async postPaymentMethod(
    customerId: string,
    createPaymentMethodDto: CreatePaymentMethodDto,
    user: User,
  ) {
    const { stripePaymentMethodId } = createPaymentMethodDto;
    const customer = await this.getCustomerById(customerId, user);
    return this.stripeService.attachPaymentMethodToCustomer(
      stripePaymentMethodId,
      customer.stripeCustomerId,
    );
  }

  async deletePaymentMethodById(
    customerId: string,
    stripePaymentMethodId: string,
    user: User,
  ) {
    const customer = await this.getCustomerById(customerId, user);
    const paymentMethods =
      await this.stripeService.getPaymentMethodsByCustomerId(
        customer.stripeCustomerId,
      );
    const paymentMethodIds = paymentMethods.data.map(
      (paymentMethod) => paymentMethod.id,
    );
    if (!paymentMethodIds.includes(stripePaymentMethodId)) {
      throw new NotFoundException(
        `PaymentMethod with ID "${stripePaymentMethodId}" not found.`,
      );
    }
    return this.stripeService.detachPaymentMethodFromCustomer(
      stripePaymentMethodId,
    );
  }
}

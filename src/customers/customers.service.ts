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
import { CreatePaymentMethodDto } from '../contracts/dto/create-payment-method.dto';
import { UsersRepository } from 'src/auth/users.repository';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private stripeService: StripeService,
    private connection: Connection,
  ) {}

  async getCustomer(user: User): Promise<Customer> {
    const found = await this.customersRepository.findOne({ user });
    if (!found) {
      throw new NotFoundException(
        `Customer with User ID "${user.id}" not found`,
      );
    }
    return found;
  }

  async adminGetCustomer(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
    user: User,
  ): Promise<void> {
    const found = await this.customersRepository.findOne({ user });
    if (found || user.role !== Role.NONE) {
      throw new BadRequestException('Customer is already registered.');
    }

    delete createCustomerDto?.userId;

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

  async adminCreateCustomer(createCustomerDto: CreateCustomerDto) {
    const { userId } = createCustomerDto;
    const found = await this.usersRepository.findOne(userId);
    if (!found) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    await this.createCustomer(createCustomerDto, found);
  }

  async getCustomerById(id: string): Promise<Customer> {
    const found = await this.customersRepository.findOne({ id });
    if (!found) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }
    return found;
  }

  async updateCustomerById(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<void> {
    const customer = await this.getCustomerById(id);
    if (updateCustomerDto?.firstName) {
      customer.firstName = updateCustomerDto.firstName;
    }
    if (updateCustomerDto?.firstNameKana) {
      customer.firstNameKana = updateCustomerDto.firstNameKana;
    }
    if (updateCustomerDto?.lastName) {
      customer.lastName = updateCustomerDto.lastName;
    }
    if (updateCustomerDto?.lastNameKana) {
      customer.lastNameKana = updateCustomerDto.lastNameKana;
    }
    if (updateCustomerDto?.phone) {
      customer.phone = updateCustomerDto.phone;
    }
    if (updateCustomerDto?.postalCode) {
      customer.postalCode = updateCustomerDto.postalCode;
    }
    if (updateCustomerDto?.birthday) {
      customer.birthday = updateCustomerDto.birthday;
    }
    try {
      await this.customersRepository.save(customer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getPaymentMethods(customerId: string) {
    const customer = await this.getCustomerById(customerId);
    return this.stripeService.getPaymentMethodsByCustomerId(
      customer.stripeCustomerId,
    );
  }

  async postPaymentMethod(
    customerId: string,
    createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    const { stripePaymentMethodId } = createPaymentMethodDto;
    const customer = await this.getCustomerById(customerId);
    return this.stripeService.attachPaymentMethodToCustomer(
      stripePaymentMethodId,
      customer.stripeCustomerId,
    );
  }

  async deletePaymentMethodById(
    customerId: string,
    stripePaymentMethodId: string,
  ) {
    const customer = await this.getCustomerById(customerId);
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

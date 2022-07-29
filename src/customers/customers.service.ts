import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { UsersRepository } from 'src/auth/users.repository';
import { StripeService } from 'src/stripe/stripe.service';
import { User } from '../auth/user.entity';
import { Customer } from './customer.entity';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private stripeService: StripeService,
  ) {}

  async getCustomer(): Promise<Customer[]> {
    return this.customersRepository.find();
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

    const queryRunner = this.customersRepository.queryRunner;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(customer);
      const response = await this.stripeService.createCustomer(
        customer.id,
        customer.firstName + customer.lastName,
        user.email,
      );
      customer.stripeId = response.id;
      queryRunner.manager.save(customer);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerById(id: string, user: User): Promise<Customer> {
    const found = await this.customersRepository.findOne({ id });

    if (!found) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    if (user.role !== UserRole.ADMIN && found.user.id !== user.id) {
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
    const customer: Customer = { ...found, ...updateCustomerByDto };
    try {
      await this.customersRepository.save(customer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

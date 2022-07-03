import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { UsersRepository } from 'src/auth/users.repository';
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
  ) {}

  async getCustomer(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
    user: User,
  ): Promise<void> {
    // ２重作成を禁止するコードが必要です...
    if (user.role === UserRole.ADMIN) {
      const found = await this.usersRepository.findOne(
        createCustomerDto.userId,
      );
      delete createCustomerDto.userId;
      this.customersRepository.createCustomer(createCustomerDto, found);
    }
    this.customersRepository.createCustomer(createCustomerDto, user);
  }

  async getCustomerById(id: string, user: User): Promise<Customer> {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new UnauthorizedException();
    }

    const found = await this.customersRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return found;
  }

  async updateCustomerById(
    id: string,
    updateCustomerByDto: UpdateCustomerDto,
    user: User,
  ): Promise<Customer> {
    const found = await this.getCustomerById(id, user);
    const customer: Customer = { ...found, ...updateCustomerByDto };
    try {
      await this.customersRepository.save(customer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return customer;
  }
}

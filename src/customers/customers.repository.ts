import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@EntityRepository(Customer)
export class CustomersRepository extends Repository<Customer> {
  async createCustomer(createCustomerDto: CreateCustomerDto, user: User) {
    const customer = this.create({
      ...createCustomerDto,
      user,
    });
    try {
      await this.save(customer);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return customer;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
  ) {}
}

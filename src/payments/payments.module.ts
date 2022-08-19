import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsRepository } from './payments.repository';
import { ContractsRepository } from '../contracts/contracts.repository';
import { CustomersRepository } from '../customers/customers.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentsRepository,
      ContractsRepository,
      CustomersRepository,
    ]),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

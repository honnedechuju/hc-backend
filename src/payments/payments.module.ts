import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsRepository } from './payments.repository';
import { ContractsRepository } from '../contracts/contracts.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { CustomersModule } from 'src/customers/customers.module';
import { StudentsModule } from 'src/students/students.module';
import { ContractsModule } from 'src/contracts/contracts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentsRepository,
      ContractsRepository,
      CustomersRepository,
    ]),
    forwardRef(() => CustomersModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => ContractsModule),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsRepository } from './contracts.repository';
import { CustomersRepository } from '../customers.repository';
import { AuthModule } from 'src/auth/auth.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { StudentsModule } from '../students/students.module';
import { PaymentsRepository } from '../payments/payments.repository';
import { ConfigService } from '@nestjs/config';
import { StudentsRepository } from '../students/students.repository';

@Module({
  providers: [ContractsService, ConfigService],
  controllers: [ContractsController],
  imports: [
    TypeOrmModule.forFeature([
      ContractsRepository,
      CustomersRepository,
      PaymentsRepository,
      StudentsRepository,
    ]),
    AuthModule,
    StudentsModule,
    forwardRef(() => StripeModule),
  ],
  exports: [ContractsService],
})
export class ContractsModule {}

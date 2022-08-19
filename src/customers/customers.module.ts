import { Module, forwardRef } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersRepository } from './customers.repository';
import { UsersRepository } from '../auth/users.repository';
import { StripeModule } from '../stripe/stripe.module';
import { StudentsRepository } from '../students/students.repository';
import { PaymentsModule } from '../payments/payments.module';
import { AuthModule } from 'src/auth/auth.module';
import { ContractsModule } from 'src/contracts/contracts.module';

@Module({
  providers: [CustomersService],
  controllers: [CustomersController],
  imports: [
    TypeOrmModule.forFeature([
      CustomersRepository,
      UsersRepository,
      StudentsRepository,
    ]),
    AuthModule,
    PaymentsModule,
    forwardRef(() => ContractsModule),
    forwardRef(() => StripeModule),
  ],
  exports: [CustomersService],
})
export class CustomersModule {}

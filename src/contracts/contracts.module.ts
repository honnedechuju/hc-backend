import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { ContractsRepository } from './contracts.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { AuthModule } from '../auth/auth.module';
import { StripeModule } from '../stripe/stripe.module';
import { StudentsModule } from '../students/students.module';
import { PaymentsRepository } from '../payments/payments.repository';
import { UsersRepository } from '../auth/users.repository';
import { ItemsModule } from './item/items.module';
import { ItemsRepository } from './item/items.repository';
import { CustomersModule } from '../customers/customers.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  providers: [ConfigService, ContractsService],
  controllers: [ContractsController],
  imports: [
    TypeOrmModule.forFeature([
      ContractsRepository,
      UsersRepository,
      ItemsRepository,
      PaymentsRepository,
    ]),
    AuthModule,
    forwardRef(() => StudentsModule),
    forwardRef(() => CustomersModule),
    forwardRef(() => StripeModule),
    forwardRef(() => ItemsModule),
    PaymentsModule,
  ],
  exports: [ContractsService],
})
export class ContractsModule {}

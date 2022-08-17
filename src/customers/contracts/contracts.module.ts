import { Module, forwardRef } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsRepository } from './contracts.repository';
import { CustomersRepository } from '../customers.repository';
import { AuthModule } from '../../auth/auth.module';
import { StripeModule } from '../../stripe/stripe.module';
import { StudentsModule } from '../students/students.module';
import { PaymentsRepository } from '../payments/payments.repository';
import { ConfigService } from '@nestjs/config';
import { StudentsRepository } from '../students/students.repository';
import { UsersRepository } from '../../auth/users.repository';
import { ItemsModule } from './item/items.module';
import { ItemsService } from './item/items.service';
import { ItemsRepository } from './item/items.repository';

@Module({
  providers: [ConfigService, ContractsService, ItemsService],
  controllers: [ContractsController],
  imports: [
    TypeOrmModule.forFeature([
      ContractsRepository,
      UsersRepository,
      CustomersRepository,
      ItemsRepository,
      PaymentsRepository,
      StudentsRepository,
    ]),
    AuthModule,
    StudentsModule,
    forwardRef(() => StripeModule),
    ItemsModule,
  ],
  exports: [ContractsService],
})
export class ContractsModule {}

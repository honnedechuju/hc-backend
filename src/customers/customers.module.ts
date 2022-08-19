import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { StudentsService } from '../students/students.service';
import { StudentsModule } from '../students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersRepository } from './customers.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';
import { StripeModule } from '../stripe/stripe.module';
import { StudentsRepository } from '../students/students.repository';
import { PaymentsModule } from '../payments/payments.module';

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
    StripeModule,
    PaymentsModule,
  ],
  exports: [CustomersService],
})
export class CustomersModule {}

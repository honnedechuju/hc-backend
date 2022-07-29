import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsRepository } from './contracts.repository';
import { CustomersRepository } from '../customers.repository';
import { AuthModule } from 'src/auth/auth.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { StudentsModule } from '../students/students.module';

@Module({
  providers: [ContractsService],
  controllers: [ContractsController],
  imports: [
    TypeOrmModule.forFeature([ContractsRepository, CustomersRepository]),
    AuthModule,
    StripeModule,
    StudentsModule,
  ],
})
export class ContractsModule {}

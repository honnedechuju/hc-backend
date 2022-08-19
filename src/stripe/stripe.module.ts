import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomersModule } from 'src/customers/customers.module';
import { ContractsModule } from '../contracts/contracts.module';
import { PaymentsModule } from '../payments/payments.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Global()
@Module({
  imports: [
    forwardRef(() => ContractsModule),
    forwardRef(() => CustomersModule),
    PaymentsModule,
  ],
  providers: [StripeService, ConfigService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}

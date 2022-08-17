import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContractsModule } from '../customers/contracts/contracts.module';
import { PaymentsModule } from '../customers/payments/payments.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Global()
@Module({
  imports: [forwardRef(() => ContractsModule), PaymentsModule],
  providers: [StripeService, ConfigService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}

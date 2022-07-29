import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Global()
@Module({
  providers: [StripeService, ConfigService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}

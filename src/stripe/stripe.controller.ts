import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get('payment-method')
  async createPaymentMethod() {
    return this.stripeService.createPaymentMethod();
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    return this.stripeService.handleWebhook(req, res);
  }
}

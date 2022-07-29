import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  @Post('webhook')
  async webhook(@Req() req: Request) {
    console.log(req.body);
  }
}

import { Body, Controller, Post } from '@nestjs/common';

import { WebhookEvent, WebhookRequestBody } from '@line/bot-sdk';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  constructor(private lineService: LineService) {}

  @Post()
  async handler(@Body() req: WebhookRequestBody) {
    const events: WebhookEvent[] = req.events;
    events.map((event) => {
      console.log(event);
    });
  }
}

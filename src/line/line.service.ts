import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from '@line/bot-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LineService {
  private botSdkClient: Client;
  private logger = new Logger('LineService');
  constructor(private configService: ConfigService) {
    const tokens = {
      channelAccessToken: this.configService.get<string>(
        'LINE_MESSAGING_API_ACCESS_TOKEN',
      ),
      channelSecret: this.configService.get<string>(
        'LINE_MESSAGING_API_CHANNEL_SECRET',
      ),
    };
    this.botSdkClient = new Client(tokens);
  }

  async sendLineMessage(lineUserId: string, messages: Message | Message[]) {
    try {
      this.botSdkClient.pushMessage(lineUserId, messages);
    } catch (error) {
      this.logger.warn(`Cannot send push message via Line`);
      this.logger.error(error);
    }
  }
}

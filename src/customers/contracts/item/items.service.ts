import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../../customers/students/student.entity';
import Stripe from 'stripe';
import { Contract } from '../contract.entity';
import { ItemType } from './item-type.enum';
import { Item } from './item.entity';
import { ItemsRepository } from './items.repository';

@Injectable()
export class ItemsService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(ItemsRepository)
    private itemsRepository: ItemsRepository,
  ) {}

  // getItemTypeFromStripePriceId(stripePriceId: string) {
  //   switch (stripePriceId) {
  //     case this.configService.get(`STRIPE_PRICE_ID_${ItemType.LIMITED}`):
  //       return ItemType.LIMITED;
  //     case this.configService.get(`STRIPE_PRICE_ID_${ItemType.UNLIMITED}`):
  //       return ItemType.UNLIMITED;
  //     case this.configService.get(`STRIPE_PRICE_ID_${ItemType.TUTOR}`):
  //       return ItemType.TUTOR;
  //     default:
  //       throw new NotFoundException(
  //         `Stripe Price ID with "${stripePriceId}" not found.`,
  //       );
  //   }
  // }

  async createItem(type: ItemType, student?: Student, contract?: Contract) {
    let item: Item;
    switch (type) {
      case ItemType.LIMITED:
        item = this.itemsRepository.create({
          type,
          stripePriceId: this.configService.get(`STRIPE_PRICE_ID_${type}`),
          price: this.configService.get(`PRICE_OF_${type}`),
          student,
        });
        break;
      case ItemType.UNLIMITED:
        item = this.itemsRepository.create({
          type,
          stripePriceId: this.configService.get(`STRIPE_PRICE_ID_${type}`),
          price: this.configService.get(`PRICE_OF_${type}`),
          student,
          contract,
        });
        break;
      case ItemType.TUTOR:
        item = this.itemsRepository.create({
          type,
          stripePriceId: this.configService.get(`STRIPE_PRICE_ID_${type}`),
          price: this.configService.get(`PRICE_OF_${type}`),
          student,
          contract,
        });
        break;
      default:
        throw new NotFoundException();
    }
    return await this.itemsRepository.save(item);
  }

  async saveItemsFromStripeItems(
    items: Item[],
    stripeItems: Stripe.ApiList<Stripe.SubscriptionItem>,
  ) {
    const resultItems: Item[] = [];
    for (const stripeItem of stripeItems.data) {
      const item = items.find(
        (item) => item.id === stripeItem.metadata['item_id'],
      );
      item.stripePriceId = stripeItem.price.id;
      item.stripeItemId = stripeItem.id;
      resultItems.push(await this.itemsRepository.save(item));
    }
    return resultItems;
  }

  getStripeSubscriptionCreateParamsItem(items: Item[]) {
    return items.map(
      (item): Stripe.SubscriptionCreateParams.Item => ({
        price: this.configService.get(`STRIPE_PRICE_ID_${item.type}`),
        metadata: {
          student_id: item.student.id,
          item_id: item.id,
        },
      }),
    );
  }
}

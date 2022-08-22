import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';

import { Student } from '../../students/student.entity';
import { Contract } from '../contract.entity';
import { ItemType } from './item-type.enum';
import { Item } from './item.entity';
import { ItemsRepository } from './items.repository';
import { GetItemsFilterDto } from './dto/get-items-filter.dto';
import { User } from '../../auth/user.entity';
import { ContractsService } from '../contracts.service';
import { StudentsService } from '../../students/students.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemsRepository)
    private itemsRepository: ItemsRepository,

    private configService: ConfigService,
    @Inject(forwardRef(() => StudentsService))
    private studentsService: StudentsService,
    @Inject(forwardRef(() => ContractsService))
    private contractsService: ContractsService,
  ) {}

  async getItems(filterDto: GetItemsFilterDto, user?: User) {
    const { studentId, contractId } = filterDto;
    let student: Student, contract: Contract;
    if (studentId) {
      student = await this.studentsService.getStudentById(studentId, user);
    }
    if (contractId) {
      contract = await this.contractsService.getContractById(contractId, user);
    }
    return this.itemsRepository.getItems(filterDto, student, contract);
  }

  createItem(type: ItemType, student?: Student, contract?: Contract) {
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
    return item;
  }

  getUpdatedItemsFromStripeItems(
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
      resultItems.push(item);
    }
    return resultItems;
  }

  getStripeSubscriptionCreateParamsItems(items: Item[]) {
    return items.map(
      (item): Stripe.SubscriptionCreateParams.Item => ({
        price: this.configService.get(`STRIPE_PRICE_ID_${item.type}`),
        metadata: {
          student_id: item?.student?.id,
          contract_id: item?.contract?.id,
          item_id: item?.id,
        },
      }),
    );
  }

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
}

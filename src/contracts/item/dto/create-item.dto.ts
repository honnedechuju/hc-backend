import { IsEnum } from 'class-validator';
import { ItemType } from '../item-type.enum';

export class CreateItemDto {
  @IsEnum(ItemType)
  type: ItemType;
}

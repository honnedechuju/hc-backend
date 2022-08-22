import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateItemDto } from '../item/dto/create-item.dto';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items?: CreateItemDto[];

  @IsOptional()
  @IsString()
  customerId?: string;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateItemDto } from '../item/dto/create-item.dto';
export class CreateContractDto {
  @IsString()
  paymentMethodId: string;

  @IsString()
  studentId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @IsOptional()
  @IsString()
  customerId?: string;
}

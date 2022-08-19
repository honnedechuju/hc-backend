import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateItemDto } from '../item/dto/create-item.dto';

export class UpdateContractDto {
  @IsOptional()
  @IsBoolean()
  pay?: boolean;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @ValidateNested()
  items?: CreateItemDto[];

  @IsOptional()
  @IsString()
  customerId?: string;
}

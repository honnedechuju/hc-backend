import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContractStatus } from '../contract-status.enum';

export class GetContractsFilterDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastPaymentTime?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextPaymentTime?: Date;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;
}

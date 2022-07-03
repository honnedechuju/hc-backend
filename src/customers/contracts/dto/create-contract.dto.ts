import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContractType } from '../contract-type.enum';

export class CreateContractDto {
  @IsEnum(ContractType)
  type: ContractType;

  @IsOptional()
  @IsString()
  customerId: string;
}

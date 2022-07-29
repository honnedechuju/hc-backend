import { IsEnum, IsString } from 'class-validator';
import { ContractType } from '../contract-type.enum';

export class CreateContractDto {
  @IsString()
  customerId: string;

  @IsString()
  studentIds: string[];

  @IsString()
  paymentMethodId: string;

  @IsEnum(ContractType)
  contractType: ContractType;
}

import { IsArray, IsEnum, IsString } from 'class-validator';
import { ContractType } from '../contract-type.enum';

export class CreateContractDto {
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];

  @IsString()
  paymentMethodId: string;

  @IsEnum(ContractType)
  contractType: ContractType;
}

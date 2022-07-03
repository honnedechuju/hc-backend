import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContractStatus } from '../contract-status.enum';
import { ContractType } from '../contract-type.enum';

export class UpdateContractDto {
  @IsOptional()
  @IsEnum(ContractType)
  type: ContractType;

  @IsOptional()
  @IsEnum(ContractStatus)
  status: ContractStatus;
}

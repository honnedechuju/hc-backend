import { IsEnum, IsOptional } from 'class-validator';
import { ContractStatus } from '../contract-status.enum';

export class GetContractsFilterDto {
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

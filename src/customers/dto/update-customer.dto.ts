import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[ァ-ヶー　]*$/)
  firstNameKana?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[ァ-ヶー　]*$/)
  lastNameKana?: string;

  @IsOptional()
  @IsPhoneNumber('JP')
  phone?: string;

  @IsOptional()
  @Matches(/^[0-9]{3}-[0-9]{4}$/)
  postalCode?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;
}

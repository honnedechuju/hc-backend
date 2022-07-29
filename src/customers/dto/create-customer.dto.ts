import { Type } from 'class-transformer';
import { IsDate, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  firstName: string;

  @IsString()
  @Matches(/^[ァ-ヶー　]*$/)
  firstNameKana: string;

  @IsString()
  lastName: string;

  @IsString()
  @Matches(/^[ァ-ヶー　]*$/)
  lastNameKana: string;

  @IsPhoneNumber('JP')
  phone: string;

  @Matches(/^[0-9]{3}-[0-9]{4}$/)
  postalCode: string;

  @Type(() => Date)
  @IsDate()
  birthday: Date;
}

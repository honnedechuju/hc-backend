import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  username: string;

  @IsString()
  lineId: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  firstName: string;

  @IsString()
  @Matches(/^[ァ-ヶー]*$/)
  firstNameKana: string;

  @IsString()
  lastName: string;

  @IsString()
  @Matches(/^[ァ-ヶー]*$/)
  lastNameKana: string;

  @IsPhoneNumber('JP')
  phone: string;

  @Matches(/^[0-9]{3}-[0-9]{4}$/)
  postalCode: string;

  @Type(() => Date)
  @IsDate()
  birthday: Date;
}

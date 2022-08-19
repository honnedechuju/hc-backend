import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  firstNameKana: string;

  @IsString()
  lastName: string;

  @IsString()
  lastNameKana: string;

  @Type(() => Number)
  @IsInt()
  gender: number;

  @Type(() => Date)
  @IsDate()
  birthday: Date;

  @IsString()
  privateSchool: string;

  @IsString()
  publicSchool: string;
}

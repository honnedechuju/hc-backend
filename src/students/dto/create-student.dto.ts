import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  customerId: string;

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
  school: string;

  @IsString()
  juku: string;
}

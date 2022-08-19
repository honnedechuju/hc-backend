import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  firstNameKana: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  lastNameKana: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gender: number;

  @IsOptional()
  @IsString()
  privateSchool: string;

  @IsOptional()
  @IsString()
  publicSchoool: string;
}

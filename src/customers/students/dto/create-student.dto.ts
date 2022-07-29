import { IsInt, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  firstNameKana: string;

  @IsString()
  lastName: string;

  @IsString()
  lastNameKana: string;

  @IsInt()
  gender: number;

  @IsString()
  privateSchool: string;

  @IsString()
  publicSchoool: string;
}

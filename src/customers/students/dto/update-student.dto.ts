import { IsDate, IsInt, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  firstNameKana: string;

  @IsString()
  lastName: string;

  @IsString()
  lastNameKana: string;

  @IsDate()
  birthday: Date;

  @IsInt()
  gender: number;

  @IsString()
  privateSchool: string;

  @IsString()
  publicSchoool: string;
}

import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  problems: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  solutions: string[];

  @IsString()
  @IsNotEmpty()
  studentId: string;
}

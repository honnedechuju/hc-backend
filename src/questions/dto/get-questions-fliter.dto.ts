import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QuestionStatus } from '../question-status.enum';

export class GetQuestionsFilterDto {
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

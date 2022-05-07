import { IsEnum } from 'class-validator';
import { QuestionStatus } from '../question-status.enum';

export class UpdateQuestionStatusDto {
  @IsEnum(QuestionStatus)
  status: QuestionStatus;
}

import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers: [];
}

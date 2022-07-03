import { IsEnum } from 'class-validator';
import { TeacherStatus } from '../teacher-status.enum';

export class UpdateTeacherStatusDto {
  @IsEnum(TeacherStatus)
  status: TeacherStatus;
}

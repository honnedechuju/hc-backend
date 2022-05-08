import { EntityRepository, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Student } from './student.entity';

@EntityRepository(Student)
export class StudentsRepository extends Repository<Student> {
  private logger = new Logger('StudentsRepository', { timestamp: true });
}

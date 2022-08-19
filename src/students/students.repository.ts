import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './student.entity';

@EntityRepository(Student)
export class StudentsRepository extends Repository<Student> {
  async createStudent(createStudentDto: CreateStudentDto, customer: Customer) {
    const student = this.create({
      ...createStudentDto,
      customer,
    });
    try {
      await this.save(student);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return customer;
  }
}

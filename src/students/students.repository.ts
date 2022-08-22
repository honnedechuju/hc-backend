import { InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { GetStudentsFilterDto } from './dto/get-students-filter.dto';
import { Student } from './student.entity';

@EntityRepository(Student)
export class StudentsRepository extends Repository<Student> {
  private logger = new Logger(StudentsRepository.name, { timestamp: true });
  async getStudents(
    filterDto: GetStudentsFilterDto,
    user?: User,
  ): Promise<Student[]> {
    const {
      firstName,
      firstNameKana,
      lastName,
      lastNameKana,
      gender,
      birthday,
      school,
      juku,
    } = filterDto;

    const query = this.createQueryBuilder('student');

    if (user) {
      query.andWhere({ customer: user.customer });
    }

    if (firstName) {
      query.andWhere('student.firstName = :firstName', { firstName });
    }

    if (firstNameKana) {
      query.andWhere('student.firstNameKana = :firstNameKana', {
        firstNameKana,
      });
    }

    if (lastName) {
      query.andWhere('student.lastName = :lastName', { lastName });
    }

    if (lastNameKana) {
      query.andWhere('student.lastNameKana = :lastNameKana', {
        lastNameKana,
      });
    }

    if (gender) {
      query.andWhere('student.gender = :gender', {
        gender,
      });
    }

    if (birthday) {
      query.andWhere('student.birthday = :birthday', {
        birthday,
      });
    }

    if (school) {
      query.andWhere('student.school = :school', {
        school,
      });
    }

    if (juku) {
      query.andWhere('student.juku = :juku', {
        juku,
      });
    }

    query.orderBy('birthday', 'ASC');

    try {
      const students = await query.getMany();
      return students;
    } catch (error) {
      this.logger.error(
        `Failed to get students for user "${user}". Filters: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createStudent(createStudentDto: CreateStudentDto, customer: Customer) {
    delete createStudentDto?.customerId;
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

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { User } from 'src/auth/user.entity';
import { Equal } from 'typeorm';
import { CustomersRepository } from '../customers.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,
  ) {}

  async getStudents(user: User): Promise<Student[]> {
    if (user.role === UserRole.ADMIN) {
      return this.studentsRepository.find();
    }
    return this.studentsRepository.find({
      where: {
        customer: Equal(user.customer),
      },
    });
  }

  async createStudent(
    createCustomerDto: CreateStudentDto,
    user: User,
  ): Promise<void> {
    if (!user.customer) {
      throw new BadRequestException('Only customers have students');
    }
    try {
      const student = await this.studentsRepository.createStudent(
        createCustomerDto,
        user.customer,
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getStudentById(id: string, user: User): Promise<Student> {
    const found = await this.studentsRepository.findOne({
      where: {
        id,
        customer: Equal(user.customer),
      },
    });

    if (
      !found ||
      (user.role !== UserRole.ADMIN && found.customer.id !== user.customer.id)
    ) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return found;
  }

  async updateStudentById(
    id: string,
    updateStudentByDto: UpdateStudentDto,
    user: User,
  ): Promise<void> {
    const found = await this.getStudentById(id, user);
    const student: Student = { ...found, ...updateStudentByDto };
    try {
      await this.studentsRepository.save(student);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../auth/role.enum';
import { User } from '../auth/user.entity';
import { CustomersRepository } from '../customers/customers.repository';
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
    private jwtService: JwtService,
  ) {}

  async getStudents(user: User): Promise<Student[]> {
    const customer = await this.customersRepository.findOne({ user });
    if (!customer) {
      throw new BadRequestException(`You must be registered Customer`);
    }
    if (user.role === Role.ADMIN) {
      return this.studentsRepository.find();
    }
    return this.studentsRepository.find({ customer });
  }

  async createStudent(
    createCustomerDto: CreateStudentDto,
    user: User,
  ): Promise<void> {
    const customer = await this.customersRepository.findOne({ user });
    if (!customer) {
      throw new BadRequestException(`You must be registered Customer`);
    }
    try {
      await this.studentsRepository.createStudent(createCustomerDto, customer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getStudentById(id: string, user: User): Promise<Student> {
    const customer = await this.customersRepository.findOne({ user });
    if (!customer) {
      throw new BadRequestException(`You must be registered Customer`);
    }
    const found = await this.studentsRepository.findOne({
      id,
      customer,
    });

    if (!found) {
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
    const student: Student = this.studentsRepository.create({
      ...found,
      ...updateStudentByDto,
    });
    try {
      await this.studentsRepository.save(student);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async checkCustomerStudents(studentIds: string[], user: User) {
    const correctStudentIds = (await this.getStudents(user)).map(
      (student) => student.id,
    );
    const result = studentIds.filter(
      (studentId) => !correctStudentIds.includes(studentId),
    );
    if (result.length > 0) {
      throw new NotFoundException(`Student ID with "${result}" not found`);
    }
  }

  async getJwtTokenByStudentId(studentId: string, user: User) {
    return this.jwtService.sign({ username: user.username, studentId });
  }
}

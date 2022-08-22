import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemsService } from 'src/contracts/item/items.service';
import { Customer } from 'src/customers/customer.entity';
import { CustomersService } from 'src/customers/customers.service';
import { User } from '../auth/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { GetStudentsFilterDto } from './dto/get-students-filter.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,
    @Inject(forwardRef(() => CustomersService))
    private customersService: CustomersService,
    @Inject(forwardRef(() => ItemsService))
    private itemsService: ItemsService,
  ) {}

  async getStudents(
    filterDto: GetStudentsFilterDto,
    user?: User,
  ): Promise<Student[]> {
    return this.studentsRepository.getStudents(filterDto, user);
  }

  async createStudent(
    createStudentDto: CreateStudentDto,
    user?: User,
  ): Promise<void> {
    let customer: Customer;
    if (!user) {
      if (!createStudentDto?.customerId) {
        throw new NotAcceptableException();
      } else {
        customer = await this.customersService.getCustomerById(
          createStudentDto.customerId,
        );
      }
    } else {
      customer = user.customer;
    }
    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }
    delete createStudentDto?.customerId;
    try {
      await this.studentsRepository.createStudent(createStudentDto, customer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getStudentById(id: string, user?: User): Promise<Student> {
    const found = await this.studentsRepository.findOne({
      id,
    });
    if (!found) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    if (user && user.customer.id !== found.customer.id) {
      throw new UnauthorizedException();
    }

    return found;
  }

  async updateStudentById(
    id: string,
    updateStudentDto: UpdateStudentDto,
    user?: User,
  ): Promise<void> {
    await this.getStudentById(id, user);
    try {
      await this.studentsRepository.update(id, updateStudentDto);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async checkCustomerStudents(studentIds: string[], user: User) {
    const correctStudentIds = (await this.getStudents(null, user)).map(
      (student) => student.id,
    );
    const result = studentIds.filter(
      (studentId) => !correctStudentIds.includes(studentId),
    );
    if (result.length > 0) {
      throw new NotFoundException(`Student ID with "${result}" not found`);
    }
  }
}

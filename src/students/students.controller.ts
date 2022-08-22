import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { User } from '../auth/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentsService } from './students.service';
import { GetStudentsFilterDto } from './dto/get-students-filter.dto';

@Controller('students')
@UseGuards(AuthGuard())
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async getStudent(
    @GetUser() user: User,
    @Body() filterDto: GetStudentsFilterDto,
  ): Promise<Student[]> {
    if (user.role === Role.CUSTOMER) {
      return this.studentsService.getStudents(filterDto, user);
    } else if (user.role === Role.ADMIN) {
      return this.studentsService.getStudents(filterDto);
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role === Role.CUSTOMER) {
      await this.studentsService.createStudent(createStudentDto, user);
    } else if (user.role === Role.ADMIN) {
      await this.studentsService.createStudent(createStudentDto);
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Get('/:id/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getStudentById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Student> {
    if (user.role === Role.CUSTOMER) {
      return this.studentsService.getStudentById(id, user);
    } else if (user.role === Role.ADMIN) {
      return this.studentsService.getStudentById(id);
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Patch('/:id/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async updateStudentById(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role === Role.CUSTOMER) {
      await this.studentsService.updateStudentById(id, updateStudentDto, user);
    } else if (user.role === Role.ADMIN) {
      await this.studentsService.updateStudentById(id, updateStudentDto);
    }
  }
}

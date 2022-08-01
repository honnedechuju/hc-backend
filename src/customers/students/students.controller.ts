import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/auth/user-role.enum';
import { User } from 'src/auth/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentsService } from './students.service';

@Controller('/customers/:customerId/students')
@UseGuards(AuthGuard())
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async getStudent(@GetUser() user: User): Promise<Student[]> {
    return this.studentsService.getStudents(user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.studentsService.createStudent(createStudentDto, user);
  }

  @Get('/:studentId/')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async getStudentById(
    @Param('studentId') id: string,
    @GetUser() user: User,
  ): Promise<Student> {
    return this.studentsService.getStudentById(id, user);
  }

  @Patch('/:studentId/')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async updateStudentById(
    @Param('studentId') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.studentsService.updateStudentById(id, updateStudentDto, user);
  }
}

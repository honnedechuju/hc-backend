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
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { User } from '../auth/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(AuthGuard())
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getStudent(@GetUser() user: User): Promise<Student[]> {
    return this.studentsService.getStudents(user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.studentsService.createStudent(createStudentDto, user);
  }

  @Get('/:studentId/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getStudentById(
    @Param('studentId') id: string,
    @GetUser() user: User,
  ): Promise<Student> {
    return this.studentsService.getStudentById(id, user);
  }

  @Patch('/:studentId/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async updateStudentById(
    @Param('studentId') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.studentsService.updateStudentById(id, updateStudentDto, user);
  }

  @Get('/:studentId/signIn')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async signInStudentById(
    @Param('studentId') studentId: string,
    @GetUser() user: User,
  ) {
    return this.studentsService.getJwtTokenByStudentId(studentId, user);
  }
}

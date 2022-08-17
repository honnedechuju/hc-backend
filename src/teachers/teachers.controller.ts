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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherStatusDto } from './dto/update-teacher-status.dto';
import { Teacher } from './teacher.entity';
import { TeachersService } from './teachers.service';

@Controller('teachers')
@UseGuards(AuthGuard())
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  @Get()
  getTeacher(): Promise<Teacher[]> {
    return this.teachersService.getTeachers();
  }

  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  @Patch()
  async updateTeacherStatus(
    @GetUser() user: User,
    @Body() updateTeacherStatus: UpdateTeacherStatusDto,
  ): Promise<void> {
    const { status } = updateTeacherStatus;
    this.teachersService.updateStatus(user, status);
  }

  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN])
  @Post()
  async createTeacher(
    @GetUser() user: User,
    @Body() createTeacherDto: CreateTeacherDto,
  ) {
    return this.teachersService.createTeacher(createTeacherDto, user);
  }

  @Get(':id')
  async getTeacherById(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<Teacher> {
    return this.teachersService.getTeacherById(user, id);
  }
}

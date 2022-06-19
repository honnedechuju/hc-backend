import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../get-user.decorator';
import { User } from '../user.entity';
import { UpdateTeacherStatusDto } from './dto/update-teacher-status.dto';
import { TeacherStatus } from './teacher-status.enum';
import { Teacher } from './teacher.entity';
import { TeachersService } from './teachers.service';

@Controller('teachers')
@UseGuards(AuthGuard())
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Get('')
  getTeacher(@GetUser() user: User): Teacher {
    return user.teacher;
  }

  @Patch('')
  async updateTeacherStatus(
    @GetUser() user: User,
    @Body() updateTeacherStatus: UpdateTeacherStatusDto,
  ): Promise<void> {
    const { status } = updateTeacherStatus;
    this.teachersService.updateStatus(user, status);
  }
}

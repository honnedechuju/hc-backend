import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { User } from '../auth/user.entity';
import { TeacherStatus } from './teacher-status.enum';
import { Teacher } from './teacher.entity';
import { TeachersRepository } from './teachers.repository';
import { Equal } from 'typeorm';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeachersRepository)
    private teachersRepository: TeachersRepository,
  ) {}

  async getTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find();
  }

  // async createTeacher(createTeacherDto: createTeacherDto, user: User): Promise<Teacher> {
  //   return;
  // }

  async updateStatus(user: User, status: TeacherStatus): Promise<void> {
    const result = await this.teachersRepository.update(user.teacher.id, {
      status,
    });
    if (result.affected !== 1) {
      throw new InternalServerErrorException();
    }
  }

  async getTeacherById(user: User, id: string): Promise<Teacher> {
    if (user.role === UserRole.CUSTOMER) {
      throw new UnauthorizedException();
    }

    let found: Teacher;

    if (user.role === UserRole.ADMIN) {
      found = await this.teachersRepository.findOne({ id });
    } else {
      found = await this.teachersRepository.findOne({
        where: {
          id,
          user: Equal(user),
        },
      });
    }

    if (!found) {
      throw new NotFoundException(`Teacher with ID "${id}" not found`);
    }

    return found;
  }
}

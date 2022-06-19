import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { TeacherStatus } from './teacher-status.enum';
import { Teacher } from './teacher.entity';
import { TeachersRepository } from './teachers.repository';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeachersRepository)
    private teachersRepository: TeachersRepository,
  ) {}

  async updateStatus(user: User, status: TeacherStatus): Promise<void> {
    const result = await this.teachersRepository.update(user.teacher, {
      status,
    });
    if (result.affected !== 1) {
      throw new InternalServerErrorException();
    }
  }
}

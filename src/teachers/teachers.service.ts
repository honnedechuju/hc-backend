import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { Role } from '../auth/role.enum';
import { User } from '../auth/user.entity';
import { TeacherStatus } from './teacher-status.enum';
import { Teacher } from './teacher.entity';
import { TeachersRepository } from './teachers.repository';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UsersRepository } from '../auth/users.repository';
import { Permission } from '../auth/permission.enum';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeachersRepository)
    private teachersRepository: TeachersRepository,
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private connection: Connection,
  ) {}

  async getTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find();
  }

  async createTeacher(createTeacherDto: CreateTeacherDto, user: User) {
    const { username } = createTeacherDto;
    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException();
    }
    const found = await this.usersRepository.findOne({ username });
    if (!found) {
      throw new NotFoundException(`User with username: ${username} not found`);
    } else {
      if (
        found.role === Role.TEACHER ||
        found.permissions.includes(Permission.TASK)
      ) {
        throw new BadRequestException(
          `User with username "${username}" is already Teacher`,
        );
      }
    }

    const {
      nickname,
      firstName,
      firstNameKana,
      lastName,
      lastNameKana,
      phone,
      postalCode,
      birthday,
    } = createTeacherDto;

    const teacher = this.teachersRepository.create({
      nickname,
      status: TeacherStatus.ACTIVE,
      firstName,
      firstNameKana,
      lastName,
      lastNameKana,
      phone,
      postalCode,
      birthday,
      user,
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(teacher);
      user.role = Role.TEACHER;
      user.permissions.push(Permission.TASK);
      await queryRunner.manager.save(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(user: User, status: TeacherStatus): Promise<void> {
    const result = await this.teachersRepository.update(user.teacher.id, {
      status,
    });
    if (result.affected !== 1) {
      throw new InternalServerErrorException();
    }
  }

  async getTeacherById(user: User, id: string): Promise<Teacher> {
    if (user.role === Role.CUSTOMER) {
      throw new UnauthorizedException();
    }

    let found: Teacher;

    if (user.role === Role.ADMIN) {
      found = await this.teachersRepository.findOne({ id });
    } else {
      found = await this.teachersRepository.findOne({ id, user });
    }

    if (!found) {
      throw new NotFoundException(`Teacher with ID "${id}" not found`);
    }

    return found;
  }

  async getTheFewestTasksAssignedTeacher() {
    const teacher = await this.teachersRepository.findOne({
      where: { status: TeacherStatus.ACTIVE },
      order: { assignedTasksNumber: 'DESC' },
    });
    if (!teacher) {
      throw new InternalServerErrorException(
        `The fewest tasks assigned teacher eacher not found`,
      );
    }
    return teacher;
  }
}

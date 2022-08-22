import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';

import { Equal } from 'typeorm';
import { Question } from 'src/questions/question.entity';
import { TeachersService } from 'src/teachers/teachers.service';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  private logger = new Logger(TasksService.name);
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
    private teachersService: TeachersService,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: string, user: User) {
    const found = this.tasksRepository.findOne({
      where: { id, teacher: Equal(user.teacher) },
    });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async updateTaskById(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    let task = await this.getTaskById(id, user);

    task = { ...task, ...updateTaskDto };

    await this.tasksRepository.save(task);

    return task;
  }

  async createTaskFromQuestion(question: Question) {
    const teacher =
      await this.teachersService.getTheFewestTasksAssignedTeacher();
    const dueDate = this.getDueDate();
    return this.tasksRepository.create({ dueDate, question, teacher });
  }

  getDueDate() {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 1);
    if (dueDate.getHours() < 10) {
      dueDate.setHours(10);
    } else if (22 < dueDate.getHours()) {
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(10);
    }
    return dueDate;
  }

  getCheckMilliSeconds() {
    const now = new Date();
    const dateInThreeHours = new Date();
    dateInThreeHours.setHours(now.getHours() + 3);
    if (dateInThreeHours.getHours() < 10) {
      dateInThreeHours.setHours(13);
    } else if (22 < dateInThreeHours.getHours()) {
      dateInThreeHours.setDate(dateInThreeHours.getDate() + 1);
      dateInThreeHours.setHours(13);
    }
    return dateInThreeHours.getMilliseconds() - now.getMilliseconds();
  }

  async checkPendingTaskById(taskId: string) {
    const found = await this.tasksRepository.findOne(taskId);
    if (!found) {
      this.logger.error(
        `Task not found when checking pending task with ID "${taskId}"`,
      );
    }
    if (found.status !== TaskStatus.PENDING) {
      return;
    }
    await this.reassignTask(found);
  }

  async reassignTask(task: Task) {
    await this.tasksRepository.update(task.id, {
      status: TaskStatus.REJECTED,
    });
    await this.createTaskFromQuestion(task.question);
  }
}

import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository', { timestamp: true });

  async getTasks() {
    return 'get all tasks';
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  @Get()
  getTasks(): string {
    return 'This actoin returns all tasks';
  }
}

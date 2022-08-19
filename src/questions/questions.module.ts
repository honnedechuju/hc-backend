import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';
import { CustomersModule } from '../customers/customers.module';
import { CustomersRepository } from '../customers/customers.repository';
import { CustomersService } from '../customers/customers.service';
import { StudentsModule } from '../students/students.module';
import { StudentsRepository } from '../students/students.repository';
import { ImagesRepository } from '../images/images.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { QuestionsService } from './questions.service';
import { JobsModule } from 'src/jobs/jobs.module';
import { LineModule } from 'src/line/line.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsRepository,
      StudentsRepository,
      CustomersRepository,
      UsersRepository,
      ImagesRepository,
      TasksRepository,
    ]),
    AuthModule,
    StudentsModule,
    CustomersModule,
    TasksModule,
    LineModule,
    JobsModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, CustomersService],
})
export class QuestionsModule {}

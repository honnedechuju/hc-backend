import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';
import { CustomersModule } from '../customers/customers.module';
import { CustomersRepository } from '../customers/customers.repository';
import { CustomersService } from '../customers/customers.service';
import { StudentsModule } from '../customers/students/students.module';
import { StudentsRepository } from '../customers/students/students.repository';
import { ImagesRepository } from '../images/images.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { QuestionsService } from './questions.service';

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
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, CustomersService],
})
export class QuestionsModule {}

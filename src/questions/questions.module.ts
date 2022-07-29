import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersRepository } from 'src/auth/users.repository';
import { CustomersModule } from 'src/customers/customers.module';
import { CustomersRepository } from 'src/customers/customers.repository';
import { CustomersService } from 'src/customers/customers.service';
import { StudentsModule } from 'src/customers/students/students.module';
import { StudentsRepository } from 'src/customers/students/students.repository';
import { StudentsService } from 'src/customers/students/students.service';
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
    ]),
    AuthModule,
    StudentsModule,
    CustomersModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, StudentsService, CustomersService],
})
export class QuestionsModule {}

import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { StudentsController } from './students/students.controller';
import { StudentsService } from './students/students.service';
import { StudentsModule } from './students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersRepository } from './customers.repository';

@Module({
  providers: [CustomersService, StudentsService],
  controllers: [CustomersController, StudentsController],
  imports: [StudentsModule, TypeOrmModule.forFeature([CustomersRepository])],
})
export class CustomersModule {}

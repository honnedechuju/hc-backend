import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  providers: [StudentsService],
  controllers: [StudentsController],
  imports: [StudentsModule, TypeOrmModule.forFeature([StudentsRepository])],
})
export class StudentsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ContractsModule } from '../contracts/contracts.module';
import { ContractsRepository } from '../contracts/contracts.repository';
import { CustomersModule } from '../customers.module';
import { CustomersRepository } from '../customers.repository';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  providers: [StudentsService],
  controllers: [StudentsController],
  imports: [
    TypeOrmModule.forFeature([
      StudentsRepository,
      CustomersRepository,
      ContractsRepository,
    ]),
    AuthModule,
  ],
  exports: [StudentsService],
})
export class StudentsModule {}

import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { StudentsService } from './students/students.service';
import { StudentsModule } from './students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersRepository } from './customers.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  providers: [CustomersService, StudentsService],
  controllers: [CustomersController],
  imports: [
    TypeOrmModule.forFeature([CustomersRepository, UsersRepository]),
    StudentsModule,
    AuthModule,
    ContractsModule,
  ],
})
export class CustomersModule {}

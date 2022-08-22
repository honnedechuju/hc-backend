import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from 'src/contracts/item/items.module';
import { CustomersModule } from 'src/customers/customers.module';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';
import { ContractsRepository } from '../contracts/contracts.repository';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  providers: [StudentsService, ConfigService],
  controllers: [StudentsController],
  imports: [
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      UsersRepository,
      StudentsRepository,
      ContractsRepository,
    ]),
    forwardRef(() => CustomersModule),
    forwardRef(() => ItemsModule),
  ],
  exports: [StudentsService],
})
export class StudentsModule {}

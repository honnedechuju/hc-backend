import { forwardRef, Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsRepository } from './items.repository';
import { ConfigService } from '@nestjs/config';
import { StudentsModule } from 'src/students/students.module';
import { ContractsModule } from '../contracts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemsRepository]),
    forwardRef(() => StudentsModule),
    forwardRef(() => ContractsModule),
  ],
  providers: [ItemsService, ConfigService],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsController } from './contracts.controller';
import { ContractsRepository } from './contracts.repository';
import { ContractsService } from './contracts.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ContractsRepository])],
  providers: [ContractsService],
  controllers: [ContractsController],
})
export class ContractsModule {}

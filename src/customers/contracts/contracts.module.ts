import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsRepository } from './contracts.repository';
import { CustomersRepository } from '../customers.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ContractsService],
  controllers: [ContractsController],
  imports: [
    TypeOrmModule.forFeature([ContractsRepository, CustomersRepository]),
    AuthModule,
  ],
})
export class ContractsModule {}

import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersRepository } from './teachers.repository';

@Module({
  providers: [TeachersService],
  controllers: [TeachersController],
  imports: [TypeOrmModule.forFeature([TeachersRepository])],
})
export class TeachersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TeachersRepository } from './teachers.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeachersRepository, UsersRepository]),
    AuthModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}

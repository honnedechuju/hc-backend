import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { VideosRepository } from '../videos/videos.repository';
import { TasksController } from './tasks.controller';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { AnswersService } from './answers/answers.service';
import { AnswersController } from './answers/answers.controller';
import { AnswersModule } from './answers/answers.module';
import { OssrsController } from './ossrs/ossrs.controller';
import { OssrsModule } from './ossrs/ossrs.module';
import { TeachersModule } from 'src/teachers/teachers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TasksRepository, VideosRepository]),
    AuthModule,
    AnswersModule,
    OssrsModule,
    TeachersModule,
  ],
  controllers: [TasksController, AnswersController, OssrsController],
  providers: [TasksService, AnswersService],
  exports: [TasksService],
})
export class TasksModule {}

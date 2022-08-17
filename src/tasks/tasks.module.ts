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

@Module({
  imports: [
    TypeOrmModule.forFeature([TasksRepository, VideosRepository]),
    AuthModule,
    AnswersModule,
  ],
  controllers: [TasksController, AnswersController],
  providers: [TasksService, AnswersService],
})
export class TasksModule {}

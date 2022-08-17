import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { VideosRepository } from '../../videos/videos.repository';
import { TasksRepository } from '../tasks.repository';
import { AnswersController } from './answers.controller';
import { AnswersRepository } from './answers.repository';
import { AnswersService } from './answers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnswersRepository,
      TasksRepository,
      VideosRepository,
    ]),
    AuthModule,
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}

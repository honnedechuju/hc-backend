import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosRepository } from './videos.repository';

@Module({
  providers: [VideosService],
  controllers: [VideosController],
  imports: [TypeOrmModule.forFeature([VideosRepository]), AuthModule],
})
export class VideosModule {}

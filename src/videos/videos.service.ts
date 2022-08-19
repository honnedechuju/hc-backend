import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { Video } from './video.entity';
import { VideosRepository } from './videos.repository';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(VideosRepository)
    private videosRepository: VideosRepository,
  ) {}

  async createVideo(createVideoDto: CreateVideoDto, user: User) {
    const { url } = createVideoDto;
    const video = this.videosRepository.create({
      url,
      teacher: user.teacher,
      user,
    });
    await this.videosRepository.save(video);
  }
}

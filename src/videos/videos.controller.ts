import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/auth/user.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideosService } from './videos.service';

@Controller('videos')
@UseGuards(AuthGuard())
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([Role.TEACHER, Role.ADMIN])
  async postVideo(
    @GetUser() user: User,
    @Body() createVideoDto: CreateVideoDto,
  ) {
    await this.videosService.createVideo(createVideoDto, user);
  }
}

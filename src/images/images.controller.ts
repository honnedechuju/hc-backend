import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { Image } from './image.entity';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { ImagesService } from './images.service';

@Controller('images')
@UseGuards(AuthGuard())
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Get()
  async getImages(@GetUser() user: User): Promise<Image[]> {
    return this.imagesService.getImages(user);
  }

  @Get(':imageId')
  async getImageById(
    @Param('imageId') imageId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const image = await this.imagesService.getImageById(imageId, user);
    res.sendFile(image.uri, { root: './images' });
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: 'images' }))
  async uploadImage(
    @UploadedFile()
    image: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.imagesService.postImage(image, user);
  }
}

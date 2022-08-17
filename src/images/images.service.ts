import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { ImagesRepository } from './images.repository';

@Injectable()
export class ImagesService {
  constructor(private imagesRepository: ImagesRepository) {}

  async getImages(user: User) {
    return this.imagesRepository.find({ user });
  }

  async getImageById(id: string, user: User) {
    const found = await this.imagesRepository.findOne({ id });
    if (!found) {
      throw new NotFoundException(`Image with ID "${id}" not found`);
    }
    return found;
  }

  async postImage(image: Express.Multer.File, user: User) {
    return this.imagesRepository.createImage(image.filename, user);
  }
}

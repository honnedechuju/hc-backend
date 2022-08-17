import { InternalServerErrorException } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Image } from './image.entity';

@EntityRepository(Image)
export class ImagesRepository extends Repository<Image> {
  async createImage(uri: string, user: User) {
    const image = this.create({ uri, user });
    let created: Image;
    try {
      created = await this.save(image);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return created;
  }
}

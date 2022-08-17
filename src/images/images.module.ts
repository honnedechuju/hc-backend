import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesRepository } from './images.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ImagesRepository]), AuthModule],
  providers: [ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}

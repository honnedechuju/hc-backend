import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsRepository } from './items.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([ItemsRepository])],
  providers: [ItemsService, ConfigService],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}

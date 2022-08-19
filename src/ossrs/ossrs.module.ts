import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OSSR } from './ossr.entity';
import { OssrsController } from './ossrs.controller';
import { OssrsService } from './ossrs.service';

@Module({
  imports: [TypeOrmModule.forFeature([OSSR])],
  controllers: [OssrsController],
  providers: [OssrsService],
})
export class OssrsModule {}

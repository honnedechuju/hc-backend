import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  providers: [RewardsService],
  controllers: [RewardsController],
})
export class RewardsModule {}

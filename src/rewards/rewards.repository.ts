import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Reward } from './reward.entity';

@EntityRepository(Reward)
export class RewardsRepository extends Repository<Reward> {
  private logger = new Logger('RewardsRepository', { timestamp: true });
}

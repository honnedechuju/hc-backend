import { EntityRepository, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Guardian } from './guardian.entity';

@EntityRepository(Guardian)
export class GuardiansRepository extends Repository<Guardian> {
  private logger = new Logger('GuardiansRepository', { timestamp: true });
}

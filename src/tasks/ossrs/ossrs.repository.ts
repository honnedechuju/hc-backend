import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { OSSR } from './ossr.entity';

@EntityRepository(OSSR)
export class OSSRsRepository extends Repository<OSSR> {
  private logger = new Logger('OSSRsRepository', { timestamp: true });
}

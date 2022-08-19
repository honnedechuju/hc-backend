import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Answer } from './answer.entity';

@EntityRepository(Answer)
export class AnswersRepository extends Repository<Answer> {
  private logger = new Logger('AnswersRepository', { timestamp: true });
}

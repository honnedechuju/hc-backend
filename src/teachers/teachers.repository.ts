import { EntityRepository, Repository } from 'typeorm';
import { Teacher } from './teacher.entity';

@EntityRepository(Teacher)
export class TeachersRepository extends Repository<Teacher> {}

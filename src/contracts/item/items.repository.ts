import { EntityRepository, Repository } from 'typeorm';
import { Item } from './item.entity';

@EntityRepository(Item)
export class ItemsRepository extends Repository<Item> {}

import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Student } from 'src/students/student.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Contract } from '../contract.entity';
import { GetItemsFilterDto } from './dto/get-items-filter.dto';
import { Item } from './item.entity';

@EntityRepository(Item)
export class ItemsRepository extends Repository<Item> {
  private logger = new Logger(ItemsRepository.name, { timestamp: true });

  async getItems(
    filterDto: GetItemsFilterDto,
    student?: Student,
    contract?: Contract,
  ) {
    const { type, status } = filterDto;

    const query = this.createQueryBuilder('item');

    if (student) {
      query.andWhere({ student });
    }

    if (contract) {
      query.andWhere({ contract });
    }

    if (type) {
      query.andWhere({ type });
    }

    if (status) {
      query.andWhere({ status });
    }

    query.orderBy('item.createdAt', 'ASC');

    query.leftJoinAndSelect('item.student', 'student');

    query.leftJoinAndSelect('item.contract', 'contract');

    try {
      const contracts = await query.getMany();
      return contracts;
    } catch (error) {
      this.logger.error(
        `Failed to get items for student "${JSON.stringify(
          student,
        )}" and contract "${JSON.stringify(
          contract,
        )}". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { User } from 'src/auth/user.entity';
import { CustomersRepository } from '../customers.repository';
import { Contract } from './contract.entity';
import { ContractsRepository } from './contracts.repository';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractsRepository)
    private contractsRepository: ContractsRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
  ) {}

  async getContracts(user: User): Promise<Contract[]> {
    if (user.role === UserRole.ADMIN) {
      return this.contractsRepository.find();
    } else {
      return this.contractsRepository.find({
        where: { customer: user.customer },
      });
    }
  }

  async createContract(
    createContractDto: CreateContractDto,
    user: User,
  ): Promise<Contract> {
    if (user.role === UserRole.ADMIN) {
      const customer = await this.customersRepository.findOne(
        createContractDto.customerId,
      );
      delete createContractDto.customerId;
      return this.contractsRepository.createContract(
        createContractDto,
        customer,
      );
    }
    return this.contractsRepository.createContract(
      createContractDto,
      user.customer,
    );
  }

  async getContractById(id: string, user: User): Promise<Contract> {
    if (user.role === UserRole.ADMIN) {
      const found = await this.contractsRepository.findOne(id);
      if (!found) {
        throw new NotFoundException();
      }
      return found;
    }

    const found = await this.contractsRepository.findOne({
      where: {
        id,
        customer: user.customer,
      },
    });
    if (!found) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }
    return found;
  }

  async updateContractById(
    id: string,
    updateContractDto: UpdateContractDto,
    user: User,
  ): Promise<Contract> {
    const found = await this.getContractById(id, user);

    const contract: Contract = { ...found, ...updateContractDto };
    try {
      await this.contractsRepository.save(contract);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return contract;
  }
}

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-role.enum';
import { User } from 'src/auth/user.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { CustomersRepository } from '../customers.repository';
import { StudentsService } from '../students/students.service';
import { ContractStatus } from './contract-status.enum';
import { Contract } from './contract.entity';
import { ContractsRepository } from './contracts.repository';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

import { Equal } from 'typeorm';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractsRepository)
    private contractsRepository: ContractsRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    private studentsService: StudentsService,
    private stripeService: StripeService,
  ) {}

  async getContracts(user: User): Promise<Contract[]> {
    if (user.role === UserRole.ADMIN) {
      return this.contractsRepository.find();
    } else {
      return this.contractsRepository.find({
        where: { customer: Equal(user.customer) },
      });
    }
  }

  async createContract(
    createContractDto: CreateContractDto,
    user: User,
  ): Promise<Contract> {
    const customer = await this.customersRepository.findOne(user);
    const { customerId, studentIds, paymentMethodId, contractType } =
      createContractDto;
    const subscription = await this.stripeService.createSubscription(
      customerId,
      paymentMethodId,
      contractType,
    );
    const { id, status, current_period_start, current_period_end } =
      subscription;
    const stripeSubscriptionId = id;
    const lastPaymentTime = new Date(current_period_start);
    const nextPaymentTime = new Date(current_period_end);
    let contractStatus: ContractStatus;
    switch (status) {
      case 'trialing':
        contractStatus = ContractStatus.FREETRIAL;
        break;
      case 'active':
        contractStatus = ContractStatus.SETTLED;
        break;
      case 'past_due':
        contractStatus = ContractStatus.EXPIRED;
        break;
      default:
        contractStatus = ContractStatus.CANCELLED;
        break;
    }
    const students = await Promise.all(
      studentIds.map((id) => this.studentsService.getStudentById(id, user)),
    );

    return this.contractsRepository.createContract(
      contractType,
      contractStatus,
      lastPaymentTime,
      nextPaymentTime,
      stripeSubscriptionId,
      customer,
      students,
    );
  }

  async getContractById(id: string, user: User): Promise<Contract> {
    if (user.role === UserRole.ADMIN) {
      const found = await this.contractsRepository.findOne({ id });
      if (!found) {
        throw new NotFoundException();
      }
      return found;
    }

    const found = await this.contractsRepository.findOne({
      where: { id, customer: Equal(user.customer) },
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
  ): Promise<void> {
    const found = await this.getContractById(id, user);
    if (updateContractDto.type && updateContractDto.type !== found.type) {
      try {
        await this.stripeService.changeSubscriptionTypeById(
          id,
          updateContractDto.type,
        );
      } catch (error) {
        throw new InternalServerErrorException(
          `Contract with ID "${id} couldn't be cancelled`,
        );
      }
    }
    this.contractsRepository.save({ ...found, ...updateContractDto });
  }

  async cancelContractById(contractId: string, user: User) {
    const found = await this.getContractById(contractId, user);
    let deletedSubscription;
    try {
      deletedSubscription = await this.stripeService.cancelSubscriptionById(
        found.stripeSubscriptionId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Contract with ID "${contractId} couldn't be cancelled"`,
      );
    }
    if (deletedSubscription.status !== 'cancelled') {
      throw new InternalServerErrorException(
        `Contract with ID "${contractId} couldn't be cancelled"`,
      );
    }
    this.updateContractById(
      contractId,
      {
        status: ContractStatus.CANCELLED,
      },
      user,
    );
  }
}

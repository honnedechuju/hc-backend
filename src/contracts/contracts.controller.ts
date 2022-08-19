import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { User } from '../auth/user.entity';
import { Contract } from './contract.entity';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { GetContractsFilterDto } from './dto/get-contracts-filter.dto';

@Controller('contracts')
@UseGuards(AuthGuard())
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async getContracts(
    @Query() filterDto: GetContractsFilterDto,
    @GetUser() user: User,
  ): Promise<Contract[]> {
    if (user.role === Role.CUSTOMER) {
      return this.contractsService.getContracts(filterDto, user);
    } else if (user.role === Role.ADMIN) {
      return this.contractsService.getContracts(filterDto);
    } else {
      throw new BadRequestException();
    }
  }

  @Post()
  async createContract(
    @GetUser() user: User,
    @Body() createContractDto: CreateContractDto,
  ): Promise<void> {
    if (user.role === Role.CUSTOMER) {
      return this.contractsService.createContract(createContractDto, user);
    } else if (user.role === Role.ADMIN) {
      return this.contractsService.createContract(createContractDto);
    } else {
      throw new BadRequestException();
    }
  }

  @Get(':id')
  async getContractById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Contract> {
    return this.contractsService.getContractById(id, user);
  }

  @Patch(':id')
  async updateContractById(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateContractDto: UpdateContractDto,
  ): Promise<void> {
    return this.contractsService.updateContractById(
      id,
      updateContractDto,
      user,
    );
  }

  @Delete(':id')
  async cancelContractById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.contractsService.cancelContractById(id, user);
  }
}

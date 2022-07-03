import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Contract } from './contract.entity';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('customers/:customerId/contracts')
@UseGuards(AuthGuard())
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  async getContracts(@GetUser() user: User): Promise<Contract[]> {
    return this.contractsService.getContracts(user);
  }

  @Post()
  async createContract(
    @GetUser() user: User,
    @Body() createContractDto: CreateContractDto,
  ): Promise<Contract> {
    return this.contractsService.createContract(createContractDto, user);
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
  ): Promise<Contract> {
    return this.contractsService.updateContractById(
      id,
      updateContractDto,
      user,
    );
  }
}

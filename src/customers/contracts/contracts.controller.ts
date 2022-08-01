import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/auth/user-role.enum';
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
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async getContracts(@GetUser() user: User): Promise<Contract[]> {
    return this.contractsService.getContracts(user);
  }

  @Post()
  async createContract(
    @GetUser() user: User,
    @Body() createContractDto: CreateContractDto,
  ): Promise<void> {
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

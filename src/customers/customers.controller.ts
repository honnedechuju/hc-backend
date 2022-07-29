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
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/auth/user-role.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { Customer } from './customer.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(AuthGuard())
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async getCustomer(): Promise<Customer[]> {
    return this.customersService.getCustomer();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([UserRole.CUSTOMER])
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.customersService.createCustomer(createCustomerDto, user);
  }

  @Get('/:id/')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async getCustomerById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Customer> {
    return this.customersService.getCustomerById(id, user);
  }

  @Patch('/:id/')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.CUSTOMER])
  async updateCustomerById(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.customersService.updateCustomerById(id, updateCustomerDto, user);
  }
}

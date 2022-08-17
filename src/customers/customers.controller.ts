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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreatePaymentMethodDto } from './contracts/dto/create-payment-method.dto';
import { Customer } from './customer.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthService } from '../auth/auth.service';

@Controller('customers')
@UseGuards(AuthGuard())
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private authService: AuthService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getCustomer(@GetUser() user: User): Promise<Customer | Customer[]> {
    return this.customersService.getCustomer(user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([Role.NONE, Role.ADMIN])
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.customersService.createCustomer(createCustomerDto, user);
  }

  @Get('/:id/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getCustomerById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Customer> {
    return this.customersService.getCustomerById(id, user);
  }

  @Patch('/:id/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async updateCustomerById(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @GetUser() user: User,
  ): Promise<void> {
    delete updateCustomerDto.stripeId;
    await this.customersService.updateCustomerById(id, updateCustomerDto, user);
  }

  @Get('/:id/payment-methods/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getPaymentMethods(@Param('id') id: string, @GetUser() user: User) {
    return this.customersService.getPaymentMethods(id, user);
  }

  @Post('/:id/payment-methods/')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async postPaymentMethods(
    @Param('id') id: string,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @GetUser() user: User,
  ) {
    return this.customersService.postPaymentMethod(
      id,
      createPaymentMethodDto,
      user,
    );
  }

  @Delete('/:customerId/payment-methods/:paymentMethodId')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async deletePaymentMethods(
    @Param('customerId') customerId: string,
    @Param('paymentMethodId') paymentMethodId: string,
    @GetUser() user: User,
  ) {
    return this.customersService.deletePaymentMethodById(
      customerId,
      paymentMethodId,
      user,
    );
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreatePaymentMethodDto } from '../contracts/dto/create-payment-method.dto';
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
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async getCustomer(@GetUser() user: User): Promise<Customer | Customer[]> {
    if (user.role === Role.CUSTOMER) {
      return user.customer;
    } else if (user.role === Role.ADMIN) {
      return this.customersService.adminGetCustomer();
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([Role.NONE, Role.ADMIN])
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role === Role.NONE) {
      await this.customersService.createCustomer(createCustomerDto, user);
    } else if (user.role === Role.ADMIN) {
      await this.customersService.adminCreateCustomer(createCustomerDto);
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Get('/:id/')
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async getCustomerById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Customer> {
    if (user.role === Role.CUSTOMER) {
      if (user.customer.id !== id) {
        throw new UnauthorizedException();
      } else {
        return user.customer;
      }
    } else if (user.role === Role.ADMIN) {
      return this.customersService.getCustomerById(id);
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Patch('/:id/')
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async updateCustomerById(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @GetUser() user: User,
  ): Promise<void> {
    if (user.role === Role.CUSTOMER) {
      if (user.customer.id !== id) {
        throw new UnauthorizedException();
      } else {
        await this.customersService.updateCustomerById(id, updateCustomerDto);
      }
    } else if (user.role === Role.ADMIN) {
      await this.customersService.updateCustomerById(id, updateCustomerDto);
    } else {
      throw new BadRequestException(`No permission`);
    }
  }

  @Get('/:id/payment-methods/')
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async getPaymentMethods(@Param('id') id: string, @GetUser() user: User) {
    if (user.role === Role.CUSTOMER) {
      if (user.customer.id !== id) {
        throw new UnauthorizedException();
      } else {
        return this.customersService.getPaymentMethods(id);
      }
    } else if (user.role === Role.ADMIN) {
      return this.customersService.getPaymentMethods(id);
    } else {
      throw new BadRequestException();
    }
  }

  @Post('/:id/payment-methods/')
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async postPaymentMethods(
    @Param('id') id: string,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @GetUser() user: User,
  ) {
    if (user.role === Role.CUSTOMER) {
      if (user.customer.id !== id) {
        throw new UnauthorizedException();
      } else {
        return this.customersService.postPaymentMethod(
          id,
          createPaymentMethodDto,
        );
      }
    } else if (user.role === Role.ADMIN) {
      return this.customersService.postPaymentMethod(
        id,
        createPaymentMethodDto,
      );
    } else {
      throw new BadRequestException();
    }
  }

  @Delete('/:id/payment-methods/:paymentMethodId')
  @UseGuards(RolesGuard)
  @Roles([Role.ADMIN, Role.CUSTOMER])
  async deletePaymentMethods(
    @Param('id') id: string,
    @Param('paymentMethodId') paymentMethodId: string,
    @GetUser() user: User,
  ) {
    if (user.role === Role.CUSTOMER) {
      if (user.customer.id !== id) {
        throw new UnauthorizedException();
      } else {
        return this.customersService.deletePaymentMethodById(
          id,
          paymentMethodId,
        );
      }
    } else if (user.role === Role.ADMIN) {
      return this.customersService.deletePaymentMethodById(id, paymentMethodId);
    } else {
      throw new BadRequestException();
    }
  }
}

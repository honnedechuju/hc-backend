import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/auth/user.entity';
import { GetPaymentsFilterDto } from './dto/get-payments-filter.dto';
import { Payment } from './payment.entity';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard())
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([Role.CUSTOMER, Role.ADMIN])
  async getPayments(
    @Query() filterDto: GetPaymentsFilterDto,
    @GetUser() user: User,
  ): Promise<Payment[]> {
    if (user.role === Role.CUSTOMER) {
      return this.paymentsService.getPayments(filterDto, user);
    } else if (user.role === Role.ADMIN) {
      return this.paymentsService.getPayments(filterDto);
    } else {
      throw new BadRequestException();
    }
  }
}

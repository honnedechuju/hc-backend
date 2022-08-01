import { IsString } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  stripePaymentMethodId: string;
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Customer } from '../customers/customer.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'boolean' })
  paid: boolean;

  @Column()
  billingReason: string;

  @Column()
  stripeCustomerId: string;

  @Column()
  stripeChargeId: string;

  @Column()
  stripeInvoiceId: string;

  @Column()
  stripePaymentIntentId: string;

  @Column()
  stripeSubscriptionId: string;

  @ManyToOne(() => Contract, (contract) => contract.payments, { eager: true })
  contract: Contract;

  @ManyToOne(() => Customer, (customer) => customer.payments)
  customer: Customer;
}

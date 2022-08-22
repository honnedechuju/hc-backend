import { Student } from 'src/students/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Customer } from '../customers/customer.entity';
import { PaymentType } from './payment-type.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'boolean', default: true })
  paid: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({ nullable: true })
  billingReason: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeChargeId: string;

  @Column({ nullable: true })
  stripeInvoiceId: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @ManyToOne(() => Contract, (contract) => contract.payments, { eager: true })
  contract: Contract;

  @ManyToOne(() => Student, (student) => student.payments, { eager: true })
  student: Student;

  @ManyToOne(() => Customer, (customer) => customer.payments)
  customer: Customer;
}

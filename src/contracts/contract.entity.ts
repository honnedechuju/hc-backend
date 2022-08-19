import { Question } from '../questions/question.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Payment } from '../payments/payment.entity';
import { Student } from '../students/student.entity';
import { ContractStatus } from './contract-status.enum';
import { Item } from './item/item.entity';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.NOTPAID,
  })
  status: ContractStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastPaymentTime?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextPaymentTime?: Date;

  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  @OneToMany(() => Item, (item) => item.contract, { eager: true })
  items: Item[];

  @OneToMany(() => Payment, (payment) => payment.contract)
  payments: Payment[];

  @ManyToMany(() => Student, (student) => student.contracts)
  students: Student[];

  @ManyToOne(() => Customer, (customer) => customer.contracts, { eager: true })
  customer: Customer;
}

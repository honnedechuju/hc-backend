import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customer.entity';
import { Payment } from '../payments/payment.entity';
import { Student } from '../students/student.entity';
import { ContractStatus } from './contract-status.enum';
import { ContractType } from './contract-type.enum';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: ContractType,
  })
  type: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.SETTLED,
  })
  status: ContractStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastPaymentTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextPaymentTime: Date;

  @Column()
  stripeSubscriptionId: string;

  @OneToMany(() => Payment, (payment) => payment.contract)
  payments: Payment[];

  @ManyToMany(() => Student, (student) => student.contracts)
  students: Student[];

  @ManyToOne(() => Customer, (customer) => customer.contracts)
  customer: Customer;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customer.entity';
import { ContractStatus } from './contract-status.enum';
import { ContractType } from './contract-type.enum';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: ContractType,
    default: ContractType.LIMITED,
  })
  type: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.SETTLED,
  })
  status: ContractStatus;

  @Column({ type: 'timestamp' })
  lastPaymentTime: Date;

  @Column({ type: 'timestamp' })
  nextPaymentTime: Date;

  @ManyToOne(() => Customer, (customer) => customer.contracts)
  customer: Customer;
}

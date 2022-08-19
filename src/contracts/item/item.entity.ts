import { Student } from '../../students/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contract } from '../contract.entity';
import { ItemType } from './item-type.enum';
import { ItemStatus } from './item-status.enum';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'numeric' })
  price: number;

  @Column({
    type: 'enum',
    enum: ItemType,
  })
  type: ItemType;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.ATTACHED,
  })
  status: ItemStatus;

  @Column()
  stripePriceId: string;

  @Column({ nullable: true })
  stripeItemId?: string;

  @ManyToOne(() => Student, (student) => student.items, { eager: true })
  student: Student;

  @ManyToOne(() => Contract, (contract) => contract.items)
  contract: Contract;
}

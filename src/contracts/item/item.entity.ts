import { Student } from '../../students/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '../contract.entity';
import { ItemType } from './item-type.enum';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'numeric' })
  price: number;

  @Column({
    type: 'enum',
    enum: ItemType,
  })
  type: ItemType;

  @Column()
  stripePriceId: string;

  @Column({ nullable: true })
  stripeItemId?: string;

  @ManyToOne(() => Student, (student) => student.items, { eager: true })
  student: Student;

  @ManyToOne(() => Contract, (contract) => contract.items)
  contract: Contract;
}

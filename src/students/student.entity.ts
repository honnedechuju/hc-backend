import { Question } from '../questions/question.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Item } from '../contracts/item/item.entity';
import { Customer } from '../customers/customer.entity';
import { OSSR } from 'src/ossrs/ossr.entity';
import { StudentService } from './student-service.enum';
@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  firstNameKana: string;

  @Column()
  lastName: string;

  @Column()
  lastNameKana: string;

  @Column()
  gender: number;

  @Column('date')
  birthday: Date;

  @Column()
  privateSchool: string;

  @Column()
  publicSchool: string;

  @Column({
    type: 'enum',
    enum: StudentService,
    default: [],
    array: true,
  })
  services: StudentService[];

  @Column({ type: 'numeric', nullable: true })
  count: number;

  @Column({ type: 'numeric', nullable: true })
  stock: number;

  @OneToMany(() => Question, (question) => question.student, { eager: false })
  questions: Question[];

  @OneToMany(() => Item, (item) => item.student, { eager: false })
  items: Item[];

  @ManyToMany(() => OSSR, (ossr) => ossr.students, { eager: false })
  ossrs: OSSR[];

  @ManyToMany(() => Contract, (contract) => contract.students, { eager: false })
  @JoinTable()
  contracts: Contract[];

  @ManyToOne(() => Customer, (customer) => customer.students, { eager: true })
  customer: Customer;
}

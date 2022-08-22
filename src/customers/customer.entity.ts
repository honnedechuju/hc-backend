import { Question } from '../questions/question.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Contract } from '../contracts/contract.entity';
import { Payment } from '../payments/payment.entity';
import { Student } from '../students/student.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column()
  firstName: string;

  @Column()
  firstNameKana: string;

  @Column()
  lastName: string;

  @Column()
  lastNameKana: string;

  @Column()
  phone: string;

  @Column()
  postalCode: string;

  @Column('date')
  birthday: Date;

  @Column({
    nullable: true,
  })
  stripeCustomerId: string;

  @OneToOne(() => User, (user) => user.customer, { eager: false })
  @JoinColumn()
  user: User;

  @OneToMany(() => Payment, (payment) => payment.customer)
  payments: Payment[];

  @OneToMany(() => Student, (student) => student.customer, { eager: false })
  students: Student[];

  @OneToMany(() => Question, (question) => question.customer, {
    eager: false,
  })
  questions: Question[];

  @OneToMany(() => Contract, (contract) => contract.customer)
  contracts: Contract[];
}

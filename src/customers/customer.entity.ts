import { Question } from 'src/questions/question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Contract } from './contracts/contract.entity';
import { Student } from './students/student.entity';

@Entity()
export class Customer {
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
  phone: string;

  @Column()
  postalCode: string;

  @Column('date')
  birthday: Date;

  @OneToOne(() => User, (user) => user.customer, {})
  @JoinColumn()
  user: User;

  @OneToMany(() => Student, (student) => student.customer, { eager: false })
  students: Student[];

  @OneToMany(() => Question, (question) => question.customer, {
    eager: false,
  })
  questions: Question[];

  @OneToMany(() => Contract, (contract) => contract.customer)
  contracts: Contract[];
}

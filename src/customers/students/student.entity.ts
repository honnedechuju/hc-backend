import { Question } from 'src/questions/question.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customer.entity';
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
  cram: string;

  @Column()
  school: string;

  @OneToMany(() => Question, (question) => question.student, { eager: false })
  questions: Question[];

  @ManyToOne(() => Customer, (customer) => customer.students, { eager: true })
  customer: Customer;

  // @OneToMany((_type) => Question, (question) => question.user, { eager: false })
  // questions: Question[];

  // @OneToMany((_type) => Task, (task) => task.user, { eager: false })
  // tasks: Task[];

  // @OneToMany((_type) => Contract, (contract) => contract.user, { eager: false })
  // @Exclude({ toPlainOnly: true })
  // contracts: Contract[];

  // @OneToMany((_type) => Guardian, (guardian) => guardian.user, { eager: false })
  // @Exclude({ toPlainOnly: true })
  // guardians: Guardian[];

  // @OneToMany((_type) => Student, (student) => student.contract, {
  //   eager: false,
  // })
  // students: Student[];
}

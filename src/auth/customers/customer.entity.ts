import { Question } from 'src/questions/question.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';
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

  @OneToOne(() => User, (user) => user.customer, { eager: false })
  user: User;

  @OneToMany(() => Student, (student) => student.customer)
  students: Student[];

  @OneToMany(() => Question, (question) => question.customer, {
    eager: false,
  })
  questions: Question[];

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

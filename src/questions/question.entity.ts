import { Exclude } from 'class-transformer';
import { Customer } from 'src/auth/customers/customer.entity';
import { Student } from 'src/auth/customers/students/student.entity';
import { User } from 'src/auth/user.entity';
import { Task } from 'src/tasks/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionStatus } from './question-status.enum';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.IN_PROGRESS,
  })
  status: QuestionStatus;

  @Column('text', { array: true })
  problems: string[];

  @Column('text', { array: true })
  solutions: string[];

  @Column('text', { array: true })
  answers: string[];

  @Column()
  message: string;

  @Column()
  rating: number;

  @Column()
  request: boolean;

  @Column()
  reports: string;

  @OneToMany(() => Task, (task) => task.question, { eager: false })
  task: Task[];

  @ManyToOne(() => Student, (student) => student.questions, {
    eager: true,
  })
  @Exclude({ toPlainOnly: false })
  student: Student;

  @ManyToOne(() => Customer, (customer) => customer.questions, { eager: false })
  customer: Customer;
}

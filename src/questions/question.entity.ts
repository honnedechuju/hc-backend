import { Exclude } from 'class-transformer';
import { Contract } from '../contracts/contract.entity';
import { Customer } from '../customers/customer.entity';
import { Student } from '../students/student.entity';
import { Image } from '../images/image.entity';
import { Answer } from '../answers/answer.entity';
import { Task } from '../tasks/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionStatus } from './question-status.enum';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updateDate: Date;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.IN_PROGRESS,
  })
  status: QuestionStatus;

  @OneToMany(() => Image, (image) => image.questions, { eager: true })
  problems: Image[];

  @OneToMany(() => Image, (image) => image.problems, { eager: true })
  solutions: Image[];

  @ManyToMany(() => Answer, (answer) => answer.question, { eager: true })
  answers: Answer[];

  @Column({ nullable: true })
  message: string;

  @Column({ type: 'numeric' })
  rating: number;

  @Column({ type: 'boolean', default: false })
  request: boolean;

  @Column({ nullable: true })
  reports: string;

  @OneToMany(() => Task, (task) => task.question, { eager: false })
  tasks: Task[];

  @ManyToOne(() => Student, (student) => student.questions, {
    eager: true,
  })
  @Exclude({ toPlainOnly: false })
  student: Student;

  @ManyToOne(() => Customer, (customer) => customer.questions)
  customer: Customer;
}

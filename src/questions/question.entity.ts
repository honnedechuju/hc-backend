import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Task } from 'src/tasks/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
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
  comment: string;

  @Column()
  message: string;

  @Column()
  quantity: number;

  @Column()
  request: boolean;

  @Column()
  reports: string;

  @OneToOne((_type) => Task, (task) => task.question, { eager: false })
  task: Task;

  @ManyToOne((_type) => User, (user) => user.questions, { eager: true })
  @Exclude({ toPlainOnly: false })
  user: User;
}

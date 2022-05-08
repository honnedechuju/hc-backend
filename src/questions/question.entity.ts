import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @Column()
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

  @ManyToOne((_type) => User, (user) => user.questions, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}

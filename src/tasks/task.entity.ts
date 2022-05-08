import { Exclude } from 'class-transformer';
import { User } from '../auth/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from 'src/questions/question.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @OneToOne((_type) => Question, (question) => question.task, { eager: true })
  @Exclude({ toPlainOnly: true })
  question: Question;

  @ManyToOne((_type) => User, (user) => user.tasks, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}

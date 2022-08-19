import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { Task } from '../tasks/task.entity';
import { Answer } from '../answers/answer.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  uri: string;

  @ManyToMany(() => Question, (question) => question.answers)
  questions: Question[];

  @ManyToOne(() => Answer, (answer) => answer.videos)
  answer: Answer[];

  @ManyToOne(() => Task, (task) => task.answers)
  task: Task;
}

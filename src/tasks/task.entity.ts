import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { Teacher } from '../teachers/teacher.entity';
import { Answer } from './answers/answer.entity';
import { TaskStatus } from './task-status.enum';
import { TaskType } from './task-type.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: TaskType,
  })
  type: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: string;

  @Column({ type: 'timestamptz' })
  completedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.task, { eager: true })
  answers: Answer[];

  @ManyToOne(() => Question, (question) => question.task, { eager: true })
  question: Question;

  @ManyToOne(() => Teacher, (teacher) => teacher.tasks, { eager: true })
  @Exclude({ toPlainOnly: true })
  teacher: Teacher;
}

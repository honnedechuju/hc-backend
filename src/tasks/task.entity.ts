import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { Teacher } from '../teachers/teacher.entity';
import { TaskStatus } from './task-status.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column('text', { array: true })
  answers: string[];

  @Column({ type: 'timestamp' })
  answeredAt: Date;

  @Column({ type: 'timestamp' })
  completedAt: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.STARTED,
  })
  status: string;

  @ManyToOne((_type) => Question, (question) => question.task, { eager: true })
  question: Question;

  @ManyToOne((_type) => Teacher, (teacher) => teacher.tasks, { eager: true })
  @Exclude({ toPlainOnly: true })
  teacher: Teacher;
}

import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { Teacher } from '../teachers/teacher.entity';
import { Answer } from './answers/answer.entity';
import { OSSR } from './ossrs/ossr.entity';
import { TaskStatus } from './task-status.enum';
import { TaskType } from './task-type.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

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
  dueDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.task, { eager: true })
  answers: Answer[];

  @ManyToOne(() => Question, (question) => question.tasks, { eager: true })
  question: Question;

  @ManyToOne(() => OSSR, (ossr) => ossr.task)
  ossr: OSSR;

  @ManyToOne(() => Teacher, (teacher) => teacher.tasks, { eager: true })
  @Exclude({ toPlainOnly: true })
  teacher: Teacher;
}

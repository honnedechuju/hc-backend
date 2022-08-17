import { Exclude } from 'class-transformer';
import { Question } from '../../questions/question.entity';
import { Teacher } from '../../teachers/teacher.entity';
import { Video } from '../../videos/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../task.entity';
import { AnswerStatus } from './answer-status.enum';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  answeredAt: Date;

  @Column({ type: 'timestamptz' })
  completedAt: Date;

  @Column({
    type: 'enum',
    enum: AnswerStatus,
    default: AnswerStatus.STARTED,
  })
  status: AnswerStatus;

  @OneToMany(() => Video, (video) => video.answer)
  videos: Video[];

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @ManyToOne(() => Task, (task) => task.answers)
  task: Task;

  @ManyToOne(() => Teacher, (teacher) => teacher.tasks, { eager: true })
  @Exclude({ toPlainOnly: true })
  teacher: Teacher;
}

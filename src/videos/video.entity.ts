import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { Task } from '../tasks/task.entity';
import { Answer } from '../answers/answer.entity';
import { Teacher } from '../teachers/teacher.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', unique: true })
  url: string;

  @ManyToMany(() => Question, (question) => question.answers)
  questions: Question[];

  @ManyToOne(() => Answer, (answer) => answer.videos)
  answer: Answer[];

  @ManyToOne(() => Task, (task) => task.answers)
  task: Task;

  @ManyToOne(() => Teacher, (teacher) => teacher.videos)
  teacher: Teacher;

  @ManyToOne(() => User, (user) => user.videos)
  user: User;
}

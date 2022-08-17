import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ unique: true })
  uri: string;

  @ManyToOne(() => User, (user) => user.images)
  user: User;

  @ManyToOne(() => Question, (question) => question.problems)
  questions: Question[];

  @ManyToOne(() => Question, (image) => image.problems)
  problems: Question[];
}

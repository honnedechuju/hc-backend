import { Task } from 'src/tasks/task.entity';
import { Teacher } from 'src/teachers/teacher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updateDate: Date;

  @Column({ type: 'boolean' })
  paid: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  paidDate: Date;

  @OneToOne(() => Task, (task) => task.teacher)
  task: Task;

  @OneToOne(() => Teacher, (teacher) => teacher.rewards)
  teacher: Teacher;
}

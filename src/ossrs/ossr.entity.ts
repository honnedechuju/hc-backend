import { Student } from 'src/students/student.entity';
import { Teacher } from 'src/teachers/teacher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
export class OSSR {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updateDate: Date;

  @Column()
  zoomUrl: string;

  @Column({ type: 'timestamptz' })
  scheduledDate: Date;

  @ManyToMany(() => Student, (student) => student.ossrs)
  students: Student[];

  @OneToMany(() => Task, (task) => task.ossr)
  task: Task;
}

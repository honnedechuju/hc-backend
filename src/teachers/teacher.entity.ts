import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Task } from '../tasks/task.entity';

import { TeacherStatus } from './teacher-status.enum';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column()
  lineId: string;

  @Column({
    type: 'enum',
    enum: TeacherStatus,
    default: TeacherStatus.INACTIVE,
  })
  status: TeacherStatus;

  @Column()
  firstName: string;

  @Column()
  firstNameKana: string;

  @Column()
  lastName: string;

  @Column()
  lastNameKana: string;

  @Column()
  phone: string;

  @Column()
  postalCode: string;

  @Column('date')
  birthday: Date;

  @Column({ type: 'int', default: 0 })
  assignedTasksNumber: number;

  @OneToMany(() => Task, (task) => task.teacher, { eager: false })
  tasks: Task[];

  @OneToOne(() => User, (user) => user.teacher, { eager: false })
  @JoinColumn()
  user: User;
}

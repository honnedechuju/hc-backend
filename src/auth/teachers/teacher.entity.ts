import { Task } from 'src/tasks/task.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';
import { TeacherStatus } from './teacher-status.enum';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column()
  chatworkID: string;

  @Column({
    type: 'enum',
    enum: TeacherStatus,
    default: TeacherStatus.INACTIVE,
  })
  status: TeacherStatus;

  @OneToMany((_type) => Task, (task) => task.teacher, { eager: false })
  tasks: Task[];

  @OneToOne(() => User, { eager: false })
  user: User;

  // @OneToOne(() => Teacher, {eager: false})
  // teacher: Teacher

  // @OneToMany((_type) => Contract, (contract) => contract.user, { eager: false })
  // @Exclude({ toPlainOnly: true })
  // contracts: Contract[];

  // @OneToMany((_type) => Guardian, (guardian) => guardian.user, { eager: false })
  // @Exclude({ toPlainOnly: true })
  // guardians: Guardian[];

  // @OneToMany((_type) => Student, (student) => student.contract, {
  //   eager: false,
  // })
  // students: Student[];
}

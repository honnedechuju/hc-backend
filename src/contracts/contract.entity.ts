import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guardian } from '../auth/guardians/guardian.entity';
import { Student } from '../auth/students/student.entity';
import { Courses } from './courses.enum';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Courses,
    default: Courses.limited,
  })
  course: Courses;

  @Column()
  price: string;

  @Column({ type: 'date' })
  timestamp: Date;

  @CreateDateColumn()
  start: Date;

  @Column({ type: 'date' })
  lastPaymentDate: Date;

  @Column({ type: 'date' })
  nextPaymentDate: Date;

  @ManyToMany((_type) => Student, (student) => student.contract, {
    eager: true,
  })
  student: Student;

  @ManyToMany((_type) => Guardian, (guardian) => guardian.contract, {
    eager: true,
  })
  @Exclude({ toPlainOnly: false })
  guardian: Guardian;

  @ManyToOne((_type) => User, (user) => user.contracts, { eager: false })
  user: User;
}

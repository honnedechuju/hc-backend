import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Task } from 'src/tasks/task.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '../../contracts/contract.entity';
import { Guardian } from '../guardians/guardian.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  juku: string;

  @Column()
  school: string;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column({ type: 'date' })
  birthday: Date;

  @ManyToOne((_type) => Guardian, (guardian) => guardian.students, {
    eager: false,
  })
  guardian: Guardian;

  @ManyToMany((_type) => Contract, (contract) => contract.student, {
    eager: false,
  })
  contract: Contract[];

  @ManyToOne((_type) => User, (user) => user.students, { eager: true })
  @Exclude({ toPlainOnly: false })
  user: User;
}

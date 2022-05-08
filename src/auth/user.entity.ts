import { Exclude } from 'class-transformer';
import { isEnum } from 'class-validator';
import { Question } from 'src/questions/question.entity';
import { Task } from 'src/tasks/task.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Guardian } from './guardians/guardian.entity';
import { Role } from './role.enum';
import { Student } from './students/student.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany((_type) => Question, (question) => question.user, { eager: false })
  questions: Question[];

  @OneToMany((_type) => Task, (task) => task.user, { eager: false })
  tasks: Task[];

  @OneToMany((_type) => Contract, (contract) => contract.user, { eager: false })
  @Exclude({ toPlainOnly: true })
  contracts: Contract[];

  @OneToMany((_type) => Guardian, (guardian) => guardian.user, { eager: false })
  @Exclude({ toPlainOnly: true })
  guardians: Guardian[];

  @OneToMany((_type) => Student, (student) => student.contract, {
    eager: false,
  })
  students: Student[];
}

import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '../../contracts/contract.entity';
import { Student } from '../students/student.entity';

@Entity()
export class Guardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  relationship: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  birthday: Date;

  @OneToMany((_type) => Student, (student) => student.guardian, {
    eager: false,
  })
  students: Student[];

  @ManyToOne((_type) => Contract, (contract) => contract.guardian, {
    eager: false,
  })
  contract: Contract;

  @ManyToOne((_type) => User, (user) => user.guardians, { eager: false })
  user: User;
}

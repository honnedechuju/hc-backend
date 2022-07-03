import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { UserRole } from './user-role.enum';
import { Teacher } from '../teachers/teacher.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  lineId: string;

  @Column({
    name: 'UserRole',
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @OneToOne(() => Customer, (customer) => customer.user, {
    cascade: true,
  })
  @JoinColumn()
  @Exclude({ toPlainOnly: true })
  customer: Customer;

  @OneToOne(() => Teacher, (teacher) => teacher.user, {
    cascade: true,
  })
  @JoinColumn()
  @Exclude({ toPlainOnly: true })
  teacher: Teacher;
}

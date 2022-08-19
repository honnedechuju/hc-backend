import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Role } from './role.enum';
import { Teacher } from '../teachers/teacher.entity';
import { Permission } from './permission.enum';
import { Image } from '../images/image.entity';

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

  @Column({ nullable: true })
  lineUserId: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.NONE,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: Permission,
    array: true,
    default: [],
  })
  permissions: Permission[];

  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

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

import { Exclude } from 'class-transformer';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customers/customer.entity';
import { Role } from './role.enum';
import { Teacher } from './teachers/teacher.entity';

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
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @OneToOne(() => Customer, { eager: true })
  @Exclude({ toPlainOnly: true })
  customer: Customer;

  @OneToOne(() => Teacher, { eager: true })
  @Exclude({ toPlainOnly: true })
  teacher: Teacher;

  // @OneToMany((_type) => Contract, (contract) => contract.user, { eager: false })
  // @Exclude({ toPlainOnly: true })
  // contracts: Contract[];

  // @OneToMany((_type) => Guardian, (guardian) => guardian.user, { eager: false })
  // @Exclude({ toPlainOnly: true })
  // : Guardian[];

  // @OneToMany((_type) => Student, (student) => student.contract, {
  //   eager: false,
  // })
  // students: Student[];
}

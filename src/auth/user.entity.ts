import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Role } from './role.enum';
import { Teacher } from '../teachers/teacher.entity';
import { Permission } from './permission.enum';
import { Image } from '../images/image.entity';
import { Video } from 'src/videos/video.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ unique: true })
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

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

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

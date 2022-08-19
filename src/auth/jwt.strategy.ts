import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersRepository } from '../customers/customers.repository';
import { StudentsRepository } from '../students/students.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import JwtPayload from './jwt-payload.interface';
import { Role } from './role.enum';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(TeachersRepository)
    private teachersRepository: TeachersRepository,
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.usersRepository.findOne({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    switch (user.role) {
      case Role.NONE:
        break;
      case Role.CUSTOMER:
        const customer = await this.customersRepository.findOne({ user });
        if (!customer) {
          throw new UnauthorizedException();
        }
        user.customer = customer;
        break;
      case Role.TEACHER:
        const teacher = await this.teachersRepository.findOne({ user });
        if (!teacher) {
          throw new UnauthorizedException();
        }
        user.teacher = teacher;
        break;
      case Role.ADMIN:
        break;
      default:
        break;
    }

    return user;
  }
}

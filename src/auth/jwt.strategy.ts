import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersRepository } from '../customers/customers.repository';
import { StudentsRepository } from '../customers/students/students.repository';
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
        user.customer = await this.customersRepository.findOne({ user });
        break;
      case Role.TEACHER:
        user.teacher = await this.teachersRepository.findOne({ user });
        break;
      case Role.ADMIN:
        break;
      default:
        break;
    }

    if (payload.studentId) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      user.student = await this.studentsRepository.findOne(payload.studentId);
    }

    return user as User;
  }
}

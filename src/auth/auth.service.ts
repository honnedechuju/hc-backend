import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, genSalt, hash } from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import JwtPayload from './jwt-payload.interface';
import { Role } from './role.enum';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    const { username, password, email } = createUserDto;

    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      email,
      lineUserId: '',
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{
    accessToken: string;
  }> {
    const { username, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ username });

    if (user && (await compare(password, user.password))) {
      const payload: JwtPayload = {
        username,
      };
      const accessToken: string = this.jwtService.sign(payload);
      return {
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserById(id: string, user: User): Promise<User> {
    if (id !== user.id && user.role !== Role.ADMIN) {
      throw new UnauthorizedException();
    }

    const found = await this.usersRepository.findOne({ id });

    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return found;
  }

  // async updateUserById(
  //   id: string,
  //   updateUserDto: UpdateUserDto,
  //   user: User,
  // ): Promise<void> {
  //   const found = await this.getUserById(id, user);

  //   this.usersRepository.updateUser(updateUserDto, found);
  // }
}

import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email } = createUserDto;

    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    const user = this.create({
      username,
      password: hashedPassword,
      email,
      lineId: '',
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return user;
  }

  async updateUser(updateUserDto: UpdateUserDto, user: User): Promise<void> {
    const updatedValues: Partial<UpdateUserDto> = {};
    Object.assign(updatedValues, updateUserDto);
    if (updatedValues?.password) {
      const salt = await genSalt();
      const hashedPassword = await hash(updatedValues.password, salt);
      updatedValues.password = hashedPassword;
    }
    try {
      const newUser = await this.update(user.id, updatedValues);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}

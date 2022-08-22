import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async updateUser(updateUserDto: UpdateUserDto, user: User): Promise<void> {
    const updatedValues: Partial<UpdateUserDto> = {};
    Object.assign(updatedValues, updateUserDto);
    if (updatedValues?.password) {
      const salt = await genSalt();
      const hashedPassword = await hash(updatedValues.password, salt);
      updatedValues.password = hashedPassword;
    }
    try {
      await this.update(user.id, updatedValues);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}

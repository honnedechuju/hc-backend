import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomersService } from '../customers/customers.service';
import { CustomersRepository } from '../customers/customers.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { TeachersService } from '../teachers/teachers.service';
import { StudentsRepository } from '../customers/students/students.repository';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 60 * 60 * 24 * 7,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      UsersRepository,
      CustomersRepository,
      TeachersRepository,
      StudentsRepository,
    ]),
  ],
  providers: [AuthService, CustomersService, TeachersService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}

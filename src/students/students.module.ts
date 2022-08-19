import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../auth/users.repository';
import { ContractsRepository } from '../contracts/contracts.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  providers: [StudentsService, ConfigService],
  controllers: [StudentsController],
  imports: [
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      UsersRepository,
      StudentsRepository,
      CustomersRepository,
      ContractsRepository,
    ]),
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
  ],
  exports: [StudentsService],
})
export class StudentsModule {}

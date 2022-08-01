import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsModule } from './questions/questions.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationScheme } from './config.scheme';
import { TasksModule } from './tasks/tasks.module';
import { CustomersModule } from './customers/customers.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './customers/students/students.module';
import { PaymentsModule } from './customers/payments/payments.module';
import { PaymentsService } from './customers/payments/payments.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationScheme,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
      }),
    }),
    QuestionsModule,
    AuthModule,
    TasksModule,
    CustomersModule,
    StudentsModule,
    TeachersModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

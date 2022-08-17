import { User } from '../auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-fliter.dto';
import { Question } from './question.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Customer } from '../customers/customer.entity';
import { Student } from '../customers/students/student.entity';
import { Image } from '../images/image.entity';

@EntityRepository(Question)
export class QuestionsRepository extends Repository<Question> {
  private logger = new Logger('TasksRepository', { timestamp: true });

  async getQuestions(
    filterDto: GetQuestionsFilterDto,
    user: User,
  ): Promise<Question[]> {
    const { status, search, studentId } = filterDto;

    const query = this.createQueryBuilder('question');

    query.where({ customer: user.customer });

    if (status) {
      query.andWhere('question.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(question.title) LIKE LOWER(:search) OR LOWER(question.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (studentId) {
      query.andWhere('question.student = :student', { student: studentId });
    }

    query.orderBy('timestamp', 'DESC');

    try {
      const questions = await query.getMany();
      return questions;
    } catch (error) {
      this.logger.error(
        `Failed to get questions for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    problems: Image[],
    solutions: Image[],
    customer: Customer,
    student: Student,
  ): Promise<Question> {
    const { title, description } = createQuestionDto;
    const question = this.create({
      title,
      description,
      problems,
      solutions,
      customer,
      student,
    });

    await this.save(question);

    return question;
  }
}

import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-fliter.dto';
import { QuestionStatus } from './question-status.enum';
import { Question } from './question.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Question)
export class QuestionsRepository extends Repository<Question> {
  private logger = new Logger('TasksRepository', { timestamp: true });

  async getQuestions(
    filterDto: GetQuestionsFilterDto,
    user: User,
  ): Promise<Question[]> {
    const { status, search } = filterDto;

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
    user: User,
  ): Promise<Question> {
    const { title, description, problems, solutions } = createQuestionDto;
    const question = this.create({
      title,
      description,
      status: QuestionStatus.IN_PROGRESS,
      timestamp: new Date(),
      problems,
      solutions,
      answers: [],
      message: '',
      rating: 0,
      request: false,
      reports: '',
      customer: user.customer,
    });

    await this.save(question);

    return question;
  }
}

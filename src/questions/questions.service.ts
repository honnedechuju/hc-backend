import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionStatus } from './question-status.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-fliter.dto';
import { QuestionsRepository } from './questions.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionsRepository)
    private questionsRepository: QuestionsRepository,
  ) {}

  async getQuestions(
    filterDto: GetQuestionsFilterDto,
    user: User,
  ): Promise<Question[]> {
    return this.questionsRepository.getQuestions(filterDto, user);
  }

  async getQuestionById(id: string, user: User): Promise<Question> {
    const found = this.questionsRepository.findOne({
      where: { id, customer: user.customer },
    });

    if (!found) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return found;
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    user: User,
  ): Promise<Question> {
    return this.questionsRepository.createQuestion(createQuestionDto, user);
  }

  async deleteQuestion(id: string, user: User): Promise<void> {
    const result = await this.questionsRepository.delete({
      id,
      customer: user.customer,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
  }

  async updateQuestionStatus(
    id: string,
    status: QuestionStatus,
    user: User,
  ): Promise<Question> {
    const question = await this.getQuestionById(id, user);

    question.status = status;
    await this.questionsRepository.save(question);

    return question;
  }
}

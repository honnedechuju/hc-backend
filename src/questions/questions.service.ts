import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionStatus } from './question-status.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-fliter.dto';
import { QuestionsRepository } from './questions.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { User } from '../auth/user.entity';
import { CustomersRepository } from '../customers/customers.repository';
import { StudentsRepository } from '../customers/students/students.repository';
import { ImagesRepository } from '../images/images.repository';
import { Image } from '../images/image.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(ImagesRepository)
    private imagesRepository: ImagesRepository,
    @InjectRepository(QuestionsRepository)
    private questionsRepository: QuestionsRepository,
    @InjectRepository(CustomersRepository)
    private customersRepository: CustomersRepository,
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,
  ) {}

  async getQuestions(
    filterDto: GetQuestionsFilterDto,
    user: User,
  ): Promise<Question[]> {
    return this.questionsRepository.getQuestions(filterDto, user);
  }

  async getQuestionById(id: string, user: User): Promise<Question> {
    const customer = await this.customersRepository.findOne({ user });
    const found = this.questionsRepository.findOne({
      where: { id, customer },
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
    const customer = await this.customersRepository.findOne({ user });
    const {
      problems: problemImageIds,
      solutions: solutionImageIds,
      studentId,
    } = createQuestionDto;

    const problems: Image[] = [];
    for (const problemImageId of problemImageIds) {
      const problem = await this.imagesRepository.findOne({
        id: problemImageId,
        user,
      });
      if (!problem) {
        throw new NotFoundException(
          `Problem with ID "${problemImageId}" not found`,
        );
      }
      problems.push(problem);
    }

    const solutions: Image[] = [];
    for (const solutionImageId of solutionImageIds) {
      const solution = await this.imagesRepository.findOne({
        id: solutionImageId,
        user,
      });
      if (!solution) {
        throw new NotFoundException(
          `Problem with ID "${solutionImageId}" not found`,
        );
      }
      solutions.push(solution);
    }
    const student = await this.studentsRepository.findOne({
      id: studentId,
      customer,
    });

    return this.questionsRepository.createQuestion(
      createQuestionDto,
      problems,
      solutions,
      customer,
      student,
    );
  }

  async deleteQuestion(id: string, user: User): Promise<void> {
    const customer = await this.customersRepository.findOne({ user });
    const result = await this.questionsRepository.delete({
      id,
      customer,
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

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Message } from '@line/bot-sdk';

import { QuestionStatus } from './question-status.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-fliter.dto';
import { QuestionsRepository } from './questions.repository';
import { Question } from './question.entity';
import { User } from '../auth/user.entity';
import { StudentsRepository } from '../students/students.repository';
import { ImagesRepository } from '../images/images.repository';
import { Image } from '../images/image.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { JobsService } from 'src/jobs/jobs.service';
import { LineService } from 'src/line/line.service';
import { TaskStatus } from 'src/tasks/task-status.enum';
import { StudentService } from 'src/students/student-service.enum';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(ImagesRepository)
    private imagesRepository: ImagesRepository,
    @InjectRepository(QuestionsRepository)
    private questionsRepository: QuestionsRepository,
    @InjectRepository(StudentsRepository)
    private studentsRepository: StudentsRepository,
    private tasksService: TasksService,
    private lineService: LineService,
    private jobsService: JobsService,
    private connection: Connection,
  ) {}

  async getQuestions(
    filterDto: GetQuestionsFilterDto,
    user: User,
  ): Promise<Question[]> {
    return this.questionsRepository.getQuestions(filterDto, user);
  }

  async getQuestionById(id: string, user?: User): Promise<Question> {
    const found = await this.questionsRepository.findOne({
      id,
    });

    if (!found) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    if (user) {
      if (found.customer.id !== user.customer.id) {
        throw new NotFoundException(`Question with ID "${id}" not found`);
      }
    }
    return found;
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    user: User,
  ): Promise<void> {
    const customer = user.customer;

    const {
      problems: problemImageIds,
      solutions: solutionImageIds,
      studentId,
    } = createQuestionDto;

    // その生徒が質問できるかのチェック
    const student = await this.studentsRepository.findOne({
      id: studentId,
      customer,
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    if (!student.services.includes(StudentService.QUESTION)) {
      throw new BadRequestException(
        `Student with ID "${studentId}" has no permission`,
      );
    }

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

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const question = await this.questionsRepository.createQuestion(
        createQuestionDto,
        problems,
        solutions,
        customer,
        student,
      );

      // もしユーザーがLINE連携をしていれば、質問メッセージを送信する
      if (user.lineUserId) {
        const message: Message = {
          type: 'text',
          text: '新しい質問が送信されました。',
        };
        this.lineService.sendLineMessage(user.lineUserId, message);
      }

      const task = await this.tasksService.createTaskFromQuestion(question);

      await queryRunner.manager.save(question);
      const savedTask = await queryRunner.manager.save(task);

      await queryRunner.manager.update(
        Question,
        { id: question.id },
        { tasks: [savedTask] },
      );
      await queryRunner.commitTransaction();

      // もし講師が放置したらやばいので、それ用のコードを用意する
      this.jobsService.addTimeout(
        `TASK_${TaskStatus.PENDING}_ID_${savedTask.id}`,
        this.tasksService.getCheckMilliSeconds(),
        async () => {
          this.tasksService.checkPendingTaskById(savedTask.id);
        },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async deleteQuestion(id: string, user?: User): Promise<void> {
    const result = await this.questionsRepository.delete({
      id,
      customer: user ? user.customer : null,
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

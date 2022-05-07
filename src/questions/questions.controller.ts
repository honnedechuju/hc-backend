import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-fliter.dto';
import { UpdateQuestionStatusDto } from './dto/update-question-status.dto';
import { Question } from './question.entity';
import { QuestionsService } from './questions.service';
import { Logger } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('questions')
@UseGuards(AuthGuard())
export class QuestionsController {
  private logger = new Logger('TasksController');
  constructor(private questionsService: QuestionsService) {}

  @Get()
  async getQuestions(
    @Query() filterDto: GetQuestionsFilterDto,
    @GetUser() user: User,
  ): Promise<Question[]> {
    this.logger.verbose(
      `User "${
        user.username
      }" retrieving all questions. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.questionsService.getQuestions(filterDto, user);
  }

  @Get('/:id')
  async getQuestionById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Question> {
    return this.questionsService.getQuestionById(id, user);
  }

  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @GetUser() user: User,
  ): Promise<Question> {
    return this.questionsService.createQuestion(createQuestionDto, user);
  }

  @Delete('/:id')
  async deleteQuestion(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.questionsService.deleteQuestion(id, user);
  }

  @Patch('/:id/status')
  async updateQuestionStatus(
    @Param('id') id: string,
    @Body() updateQuestionStatus: UpdateQuestionStatusDto,
    @GetUser() user: User,
  ): Promise<Question> {
    const { status } = updateQuestionStatus;
    return this.questionsService.updateQuestionStatus(id, status, user);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'problems' }, { name: 'answers' }], {
      dest: './upload',
    }),
  )
  async uploadFiles(
    @UploadedFiles()
    files: {
      problems: Express.Multer.File[];
      answers: Express.Multer.File[];
    },
  ) {
    console.log(files);
    const response = { problems: [], answers: [] };
    files.problems.forEach((file) => {
      const fileReponse = {
        originalName: file.originalname,
        filename: file.filename,
      };
      response.problems.push(fileReponse);
    });
    files.answers.forEach((file) => {
      const fileReponse = {
        originalName: file.originalname,
        filename: file.filename,
      };
      response.answers.push(fileReponse);
    });
    return response;
  }

  @Get('/upload/:filename')
  async seeUploadedFile(@Param('filename') filename, @Res() res) {
    console.log(filename);
    res.sendFile(filename, { root: './upload' });
  }
}

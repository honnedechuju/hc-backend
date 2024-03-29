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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsFilterDto } from './dto/get-questions-filter.dto';
import { UpdateQuestionStatusDto } from './dto/update-question-status.dto';
import { Question } from './question.entity';
import { QuestionsService } from './questions.service';
import { Logger } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permission.enum';

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
    return this.questionsService.getQuestions(filterDto, user);
  }

  @Get('/:id')
  async getQuestionById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Question> {
    return this.questionsService.getQuestionById(id, user);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.QUESTION)
  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @GetUser() user: User,
  ): Promise<void> {
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

  @Post('images')
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

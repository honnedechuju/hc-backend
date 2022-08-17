import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Student } from './student.entity';

export const GetStudent = createParamDecorator(
  (_data, ctx: ExecutionContext): Student => {
    const req = ctx.switchToHttp().getRequest();
    return req.user.student;
  },
);

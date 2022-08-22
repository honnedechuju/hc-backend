import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard())
  async getUser(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('/:id')
  @UseGuards(AuthGuard())
  async getAuthById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<User> {
    return this.authService.getUserById(id, user);
  }

  // @Patch('/:id')
  // @UseGuards(AuthGuard())
  // async updateAuthById(
  //   @GetUser() user: User,
  //   @Param() id: string,
  //   @Query('otp') oneTimePassword: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.authService.updateUserById(id, updateUserDto, user);
  // }
}

import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-auth.dto';
import { LoginUserDto } from '../user/dto/login-auth.dto';

import { BaseUserDto } from '../user/dto/base-user.dto';

@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  //swagger
  @ApiOperation({ summary: 'sign up user' })
  @ApiBody({ description: 'sign up user', type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email or password',
  })

  // sign-up
  @UsePipes(new ValidationPipe())
  @Post('/sign-up')
  register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    return this.userService.signUp(dto, res);
  }

  //swagger
  @ApiOperation({ summary: 'sign in user' })
  @ApiBody({ description: 'sign in auth user', type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User does not exist',
  })

  // sign-in
  @UseGuards(AuthGuard('local'))
  @UsePipes(new ValidationPipe())
  @Post('/sign-in')
  login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    return this.userService.signIn(dto, res);
  }

  //swagger
  @ApiOperation({ summary: 'refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token invalid or expired',
  })

  // refresh
  @UseGuards(AuthGuard('jwt-refresh'))
  @UsePipes(new ValidationPipe())
  @Post('/refresh')
  refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { sub, email } = req.user;
    return this.userService.refreshToken(sub, email, res);
  }
}

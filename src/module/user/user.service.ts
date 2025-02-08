import Redis from 'ioredis';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { PrismaService } from 'src/common/prisma/prisma.service';

import { UpdateUserDto } from './dto/update-auth.dto';
import { CreateUserDto } from './dto/create-auth.dto';
import { notFoundException } from 'src/common/utils/error.util';

import { AuthService } from '../auth/auth.service';
import { UserResponseDto } from './dto/response/response-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redisClient: Redis,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  create(email: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(req: ExpressRequest, dto: UpdateUserDto): Promise<UserResponseDto> {
    const id = this.authService.getTokenCookieId(req);

    const userExists = await this.findById(id);
    notFoundException(!userExists, `User with ID ${id} not found`);

    const password = dto.password 
    ? await this.authService.hashedPassword(dto.password)
    : undefined;

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: dto.email,
        ...(password && { password }),
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async remove(req: ExpressRequest, res: ExpressResponse): Promise<{ message: string }> {
    const id = this.authService.getTokenCookieId(req);

    const userExists = await this.findById(id);

    notFoundException(!userExists, `User with ID ${id} not found`);

    await this.redisClient.del(`user:${id}`);

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    res.clearCookie('accessToken');

   return { message: 'Deleted successfully !' };
  }
}

import { Injectable } from '@nestjs/common';
import { WordCard } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

import { CreateCardDto } from './dto/create-card.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthService } from '../auth/auth.service';
import { PaginationDto } from './dto/pagination/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/constants';
import { notFoundException } from 'src/common/utils/error.util';

@Injectable()
export class CardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(req: ExpressRequest, dto: CreateCardDto): Promise<WordCard> {
    const userId = this.authService.getTokenCookieId(req);
    const data = {
      userId,
      word: dto.word,
      translation: dto.translation,
      isDelete: dto.isDelete,
      examples: {
        create: dto.examples?.map((example) => ({
          text: example.text,
        })),
      },
    };
    const wordCard = await this.prisma.wordCard.create({
      data,
      include: { examples: true },
    });
    return wordCard;
  }

  findAll(dto: PaginationDto, req: ExpressRequest): Promise<WordCard[]> {
    const userId = this.authService.getTokenCookieId(req);

    return this.prisma.wordCard.findMany({
      where: { userId },
      skip: dto.skip,
      take: dto.limit ?? DEFAULT_PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(req: ExpressRequest, id: number): Promise<WordCard | null> {
    const userId = this.authService.getTokenCookieId(req);

    const uniqueCard = await this.findByIdAndUser(id, userId);

    notFoundException(!uniqueCard, `Card with id:${id} not found`);

    return uniqueCard;
  }

  async update(
    req: ExpressRequest,
    id: number,
    dto: UpdateCardDto,
  ): Promise<WordCard> {
    const userId = this.authService.getTokenCookieId(req);

    const data = {
      word: dto.word,
      translation: dto.translation,
      isDelete: dto.isDelete,
      examples: {
        deleteMany: { wordCardId: id },
        create: dto.examples?.map((example) => ({
          text: example.text,
        })),
      },
    };
    const updateCard = await this.prisma.wordCard.update({
      where: {
        id,
        userId,
      },
      data,
      include: { examples: true },
    });

    notFoundException(!updateCard, `Card with id:${id} not found`);

    return updateCard;
  }

  async remove(req: ExpressRequest, id: number): Promise<WordCard> {
    const userId = this.authService.getTokenCookieId(req);

    const deleteCard = await this.prisma.wordCard.update({
      where: {
        id,
        userId,
      },
      data: {
        isDelete: true,
      },
    });

    notFoundException(!deleteCard, `Card with id:${id} not found`);

    return deleteCard;
  }

  // private methods
  private findByIdAndUser(
    id: number,
    userId: number,
  ): Promise<WordCard | null> {
    return this.prisma.wordCard.findUnique({
      where: {
        id,
        userId,
      },
    });
  }
}

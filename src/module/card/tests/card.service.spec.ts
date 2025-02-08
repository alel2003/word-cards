import { Request as ExpressRequest } from 'express';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CardService } from 'src/module/card/card.service';
import { AuthService } from 'src/module/auth/auth.service';
import { BASE_WORD_CARD,  PAGINATION_SETTING, UPDATE_WORD_CARD, USER_ID, } from 'src/common/tests/constants/card';
import { mockRequest } from 'src/common/tests/utils';

describe('CardService', () => {
  let cardService: CardService;

  const mockPrismaServise = {
    wordCard: {
      create: jest.fn().mockResolvedValue(BASE_WORD_CARD),
      findMany: jest.fn().mockResolvedValue([BASE_WORD_CARD]),
      findUnique: jest.fn().mockResolvedValue(BASE_WORD_CARD),
      update: jest.fn(),
    },
  };

  const mockAuthService = {
    getTokenCookieId: jest.fn().mockReturnValue(USER_ID)
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CardService,
        { provide: PrismaService, useValue: mockPrismaServise },
        { provide: AuthService, useValue: mockAuthService }
      ],
    }).compile();

    cardService = moduleRef.get<CardService>(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of cards', async () => {
    const result = await cardService.findAll(PAGINATION_SETTING, mockRequest);
    
    expect(result).toEqual([BASE_WORD_CARD]);
    expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);

    expect(mockPrismaServise.wordCard.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      skip: PAGINATION_SETTING.skip,
      take: PAGINATION_SETTING.limit,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return a single card', async () => {
    const result = await cardService.findOne(mockRequest, BASE_WORD_CARD.id);

    expect(result).toEqual(BASE_WORD_CARD);
    expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);

    expect(mockPrismaServise.wordCard.findUnique).toHaveBeenCalledWith({
      where: { id: BASE_WORD_CARD.id, userId: USER_ID },
    });
  });

  it('should create a new card', async () => {
    const result = await cardService.create(mockRequest, BASE_WORD_CARD);
    const {word, translation, userId, isDelete, examples} = BASE_WORD_CARD;

    expect(result).toEqual(BASE_WORD_CARD);
    expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);
    
    expect(mockPrismaServise.wordCard.create).toHaveBeenCalledWith({
      data: {
        word,
        translation,
        userId,
        isDelete,
        examples: {
          create: examples
        }
      },
      include: { examples: true },
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const {word, translation, examples} = UPDATE_WORD_CARD;

      mockPrismaServise.wordCard.update.mockResolvedValue(UPDATE_WORD_CARD);
      
      const result = await cardService.update(
        mockRequest,
        BASE_WORD_CARD.id,
        UPDATE_WORD_CARD,
      );
      expect(result).toEqual(UPDATE_WORD_CARD);
      expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);

      expect(mockPrismaServise.wordCard.update).toHaveBeenCalledWith({
        where: { id: BASE_WORD_CARD.id, userId: USER_ID },
        data: {
          word,
          translation,
          examples: {
            deleteMany: { wordCardId: BASE_WORD_CARD.id }, 
            create: examples, 
          },
        },
        include: { examples: true }
      });
    });
  });

  describe('remove', () => {
    it('should delete a card', async () => {
      mockPrismaServise.wordCard.update.mockResolvedValue(BASE_WORD_CARD);

      const result = await cardService.remove(mockRequest, BASE_WORD_CARD.id);

      expect(result).toEqual(BASE_WORD_CARD);
      expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);

      expect(mockPrismaServise.wordCard.update).toHaveBeenCalledWith({
        where: { id: BASE_WORD_CARD.id, userId: USER_ID },
        data: {
          isDelete: true, 
        },
      });
    });
  });
});

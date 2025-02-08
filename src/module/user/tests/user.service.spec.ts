import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserService } from 'src/module/user/user.service';
import { USER_ID } from 'src/common/tests/constants/card';
import { AuthService } from 'src/module/auth/auth.service';
import { BASEUSER, DELETE_RES, REGISTERUSER, UPDATE_USER } from 'src/common/tests/constants/user';
import { ACCESSTOKEN, ACCESSTOKENKEY } from 'src/common/tests/constants/auth';
import { mockCookieResponse, mockRequest } from 'src/common/tests/utils';

describe('UserService', () => {
  let userService: UserService;

  const mockPrismaServise = {
    user: {
      create: jest.fn().mockResolvedValue(BASEUSER),
      update: jest.fn().mockResolvedValue(UPDATE_USER),
      delete: jest.fn().mockResolvedValue(DELETE_RES),
      findUnique: jest.fn().mockResolvedValue(BASEUSER),
    },
  };

  const mockAuthService = {
    getTokenCookieId: jest.fn().mockReturnValue(USER_ID),
    hashedPassword: jest.fn().mockResolvedValue(UPDATE_USER.password)
  };

  const mockRedisClient = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaServise },
        { provide: AuthService, useValue: mockAuthService },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    const result = await userService.create(REGISTERUSER.email, REGISTERUSER.password);

    expect(result).toEqual(BASEUSER);

    expect(mockPrismaServise.user.create).toHaveBeenCalledWith({
      data: { email: REGISTERUSER.email, password: REGISTERUSER.password },
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userExists = await userService.findById(USER_ID);
      const result = await userService.update(mockRequest, UPDATE_USER);

      expect(userExists).toEqual(BASEUSER)
      expect(result).toEqual(UPDATE_USER);
      expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);

      expect(mockPrismaServise.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: {
          email: UPDATE_USER.email,
          password: UPDATE_USER.password
        },
        select: {
          id: true,
          email: true,
        },
      });
      expect(mockAuthService.hashedPassword).toHaveBeenCalledWith(UPDATE_USER.password)
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userExists = await userService.findById(USER_ID);
      const result = await userService.remove(mockRequest, mockCookieResponse);
      
      expect(userExists).toEqual(BASEUSER);
      expect(result).toEqual(DELETE_RES);
      expect(mockAuthService.getTokenCookieId).toHaveBeenCalledWith(mockRequest);

      expect(mockPrismaServise.user.delete).toHaveBeenCalledWith({
        where: {
          id: USER_ID
        },
      });

      expect(
        mockCookieResponse.clearCookie
      ).toHaveBeenCalledWith(ACCESSTOKENKEY);

      expect(mockRedisClient.del).toHaveBeenCalledWith(`user:${USER_ID}`)
    });
  });
});

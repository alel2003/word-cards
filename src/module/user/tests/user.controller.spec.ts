import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { Test } from '@nestjs/testing';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UserController } from 'src/module/user/user.controller';
import { UserService } from 'src/module/user/user.service';
import {
  BASEUSER,
  DELETE_RES,
  UPDATE_RES,
} from 'src/common/tests/constants/user';
import {
  mockCookieResponse,
  mockJwtGuard,
  mockRequest,
} from 'src/common/tests/utils';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    update: jest.fn().mockResolvedValue(UPDATE_RES),
    remove: jest.fn().mockResolvedValue(DELETE_RES),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should update a card', async () => {
      const result = await userController.update(mockRequest, BASEUSER);
      mockJwtGuard.canActivate({} as any);

      expect(mockJwtGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(UPDATE_RES);
      expect(userService.update).toHaveBeenCalledWith(mockRequest, BASEUSER);
    });
  });

  describe('remove', () => {
    it('should delete a card', async () => {
      const result = await userController.remove(
        mockRequest,
        mockCookieResponse,
      );
      mockJwtGuard.canActivate({} as any);

      expect(mockJwtGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(DELETE_RES);
      expect(userService.remove).toHaveBeenCalledWith(
        mockRequest,
        mockCookieResponse,
      );
    });
  });
});

import { Test } from '@nestjs/testing';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { REFRESH_TOKEN_RESULT, SIGN_IN_RESULT, SIGN_UP_RESULT } from 'src/common/tests/constants/auth';
import { BASEUSER, REGISTERUSER } from 'src/common/tests/constants/user';
import { mockCookieResponse } from 'src/common/tests/utils';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn().mockResolvedValue(SIGN_UP_RESULT),
    signIn: jest.fn().mockResolvedValue(SIGN_IN_RESULT),
    refreshToken: jest.fn().mockResolvedValue(REFRESH_TOKEN_RESULT),
  };

  const mockCookieRequest = {
    user: {
      sub: BASEUSER.id,
      email: BASEUSER.email,
    },
  } as ExpressRequest;

  const mockJwtRefreshGuard = {
    canActivate: jest.fn().mockImplementation((context) => true),
  };

  const mockLocalAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => true),
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
    .overrideGuard(AuthGuard('local'))
    .useValue(mockLocalAuthGuard) 
    .overrideGuard(AuthGuard('jwt-refresh'))
    .useValue(mockJwtRefreshGuard) 
    .compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sign-up', () => {
    it('should return a success message on sign-up', async () => {
      const result = await authController.register(
        REGISTERUSER,
        mockCookieResponse,
      );
      
      expect(result).toEqual(SIGN_UP_RESULT);
      expect(
        authService.signUp,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('sign-in', () => {
    it('should return a success message on sign-in', async () => {
      const result = await authController.login(BASEUSER, mockCookieResponse);
      await mockLocalAuthGuard.canActivate({} as any)
      
      expect(mockLocalAuthGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(SIGN_IN_RESULT);
      expect(
        authService.signIn,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    it('should return a success message on refreshToken', async () => {
      const result = await authController.refresh(
        mockCookieRequest,
        mockCookieResponse,
      );
      await mockJwtRefreshGuard.canActivate({} as any);

      expect(mockJwtRefreshGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(REFRESH_TOKEN_RESULT);
      
      expect(
        authService.refreshToken).toHaveBeenCalledTimes(1);
    });
  });
});

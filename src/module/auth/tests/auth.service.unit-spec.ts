import { Response as ExpressResponse } from 'express';
import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from 'src/module/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ACCESSTOKEN, ACCESSTOKENKEY, REFRESHTOKEN, STOREREDISREFRESHTOKEN } from 'src/common/tests/constants/auth';
import { BASEUSER, REGISTERUSER, USER_RES, USERID } from 'src/common/tests/constants/user';
import { expectSetCookie, mockCookieResponse, mockRedisClient } from 'src/common/tests/utils';

describe('AuthService (Unit Test)', () => {
  let authService: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue(ACCESSTOKENKEY),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate a user with correct credentials', async () => {
    const result = await authService.validateUser(BASEUSER.email, BASEUSER.password);
    expect(result).toEqual(USER_RES);
  });

  it('should return redis token', async () => {
    const storeRedisRefreshToken = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(authService),
      STOREREDISREFRESHTOKEN,
    )?.value as (userId: number, refreshToken: string) => Promise<'OK' | null>;

    const spy = jest.spyOn(authService as any, STOREREDISREFRESHTOKEN);

    await storeRedisRefreshToken.call(authService, USERID, REFRESHTOKEN);

    expect(spy).toHaveBeenCalledWith(USERID, REFRESHTOKEN);

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      `user:${USERID}`,
      JSON.stringify(REFRESHTOKEN),
    );
  });

  it('should generate JWT token on register', async () => {
    const token = await authService.signUp(REGISTERUSER, mockCookieResponse);

    expectSetCookie(mockCookieResponse, ACCESSTOKENKEY, ACCESSTOKEN);
    expect(token).toEqual({ access_token: ACCESSTOKEN });
  });

  it('should generate JWT token on login', async () => {
    const token = await authService.signIn(BASEUSER, mockCookieResponse);

    expectSetCookie(mockCookieResponse, ACCESSTOKENKEY, ACCESSTOKEN);
    expect(token).toEqual({ access_token: ACCESSTOKEN });
  });

  it('should return refresh token', async () => {
    const { id, email } = BASEUSER;

    const token = await authService.refreshToken(id, email, mockCookieResponse);

    expectSetCookie(mockCookieResponse, ACCESSTOKENKEY, ACCESSTOKEN);
    expect(token).toEqual({ access_token: ACCESSTOKEN });
  });
});

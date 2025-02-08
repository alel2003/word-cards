import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { USER_ID } from '../constants/card';
import { ACCESSTOKEN } from '../constants/auth';

export const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
};

export const mockCookieResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as ExpressResponse;

export const mockRequest = {
  user: { sub: USER_ID },
  cookies: {
    accessToken: ACCESSTOKEN,
  },
} as ExpressRequest;

export const mockJwtGuard = {
  canActivate: jest.fn((context) => true),
};

export function expectSetCookie(
  mockResponse: ExpressResponse,
  key: string,
  value: string,
  options: object = { httpOnly: true, secure: true },
) {
  expect(mockResponse.cookie).toHaveBeenCalledWith(key, value, options);
}

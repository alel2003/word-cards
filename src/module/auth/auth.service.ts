import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';

import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { CreateUserDto } from '../user/dto/create-auth.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserService } from 'src/module/user/user.service';
import { LoginUserDto } from '../user/dto/login-auth.dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import {
  badRequestException,
  unauthorizedException,
} from 'src/common/utils/error.util';
import { ConfigService } from '@nestjs/config';
import { JwtTokens } from './interface/jwt-token.interface';
import { TOKEN_NAME } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: number; email: string }> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException(`User with sub ${email} not found`);
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    badRequestException(!isMatch, 'Password does not match');

    return { id: user.id, email: user.email };
  }

  async signUp(
    dto: CreateUserDto,
    res: ExpressResponse,
  ): Promise<{ message: string }> {
    const userExists = await this.userService.findOneByEmail(dto.email);

    badRequestException(userExists, `User with sub ${dto.email} not found`);

    badRequestException(
      dto.password !== dto.repeatPassword,
      "Passwords don't match",
    );

    const hashedPassword: string = await this.hashedPassword(dto.password);

    const user = await this.userService.create(dto.email, hashedPassword);

    // create tokens
    const tokens = await this.getTokens({ sub: user?.id, email: user?.email });

    // adding to the redis store
    await this.storeRedisRefreshToken(user.id, tokens.refreshToken);

    // adding to the cookie store
    this.storeCookieAccess(res, tokens.accessToken);

    return { message: 'Login successful' };
  }

  async signIn(
    dto: LoginUserDto,
    res: ExpressResponse,
  ): Promise<{ message: string }> {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // create tokens
    const tokens = await this.getTokens({ sub: user?.id, email: user?.email });
    // adding to the redis store
    await this.storeRedisRefreshToken(user.id, tokens.refreshToken);

    // adding to the cookie store
    this.storeCookieAccess(res, tokens.accessToken);

    return { message: 'Login successful' };
  }

  async refreshToken(
    sub: number,
    email: string,
    res: ExpressResponse,
  ): Promise<{ message: string }> {
    const storedRefreshToken = await this.redisClient.get(`user:${sub}`);

    unauthorizedException(
      !storedRefreshToken,
      'Refresh token invalid or expired',
    );

    // create tokens
    const tokens = await this.getTokens({ sub: sub, email: email });

    // adding to the redis store
    await this.storeRedisRefreshToken(sub, tokens.refreshToken);

    // adding to the cookie store
    this.storeCookieAccess(res, tokens.accessToken);

    return { message: 'Token refreshed' };
  }

  getTokenCookieId(req: ExpressRequest): number {
    const accessToken = req.cookies?.accessToken as string;
    unauthorizedException(!accessToken, 'Access token is missing');

    const decoded = this.jwtService.verify<{ sub: number }>(accessToken, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });

    const userId = decoded.sub;
    return userId;
  }

  hashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // private methods
  private async getTokens(payload: JwtPayload): Promise<JwtTokens> {
    const [accessToken, refreshToken]: [string, string] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: payload.sub,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private storeRedisRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<'OK'> {
    return this.redisClient.set(
      `user:${userId}`,
      JSON.stringify(refreshToken),
      'EX',
      this.configService.getOrThrow<number>('REDIS_DURATION'),
    );
  }

  private storeCookieAccess(res: ExpressResponse, accessToken: string) {
    res.cookie(TOKEN_NAME, accessToken, {
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.getOrThrow<number>(
        'ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC',
      ),
    });
  }
}

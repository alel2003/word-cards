import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BEARER } from 'src/common/constants';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { unauthorizedException } from 'src/common/utils/error.util';
import { Request } from 'supertest';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    public readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('Authorization') || '';

    unauthorizedException(
      !authHeader ||
        typeof authHeader !== 'string' ||
        !authHeader.startsWith(BEARER),
      'Missing or invalid refresh token',
    );

    const refreshToken = authHeader.replace(BEARER, '').trim();

    const tokenCache = await this.redis.get(`user:${payload.sub}`);

    unauthorizedException(
      !tokenCache || tokenCache !== refreshToken,
      'Invalid refresh token.',
    );
    unauthorizedException(!refreshToken, 'Refresh token is required');

    await this.redis.del(`user:${payload.sub}`);

    return { ...payload, refreshToken };
  }
}

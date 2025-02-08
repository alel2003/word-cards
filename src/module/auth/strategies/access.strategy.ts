import Redis from 'ioredis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';

import { JwtPayload } from '../interface/jwt-payload.interface';
import { UserService } from 'src/module/user/user.service';
import { UserResponseDto } from '@user/dto/response/response-user.dto';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy) {
  constructor(
    public readonly configService: ConfigService,
    private readonly UserService: UserService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    const { sub } = payload;
    const user = await this.UserService.findById(sub);

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token')
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}

import { Module, Global, forwardRef } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DEFAULT_TYPE_REDIS } from 'src/common/constants';
import { AuthModule } from 'src/module/auth/auth.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestRedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.getOrThrow<typeof DEFAULT_TYPE_REDIS>('TYPE_REDIS'),
        url: configService.getOrThrow<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => AuthModule),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}

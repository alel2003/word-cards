import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { DESCRIPTION_API_PROJECT, NAME_API_PROJECT } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle(NAME_API_PROJECT)
    .setDescription(DESCRIPTION_API_PROJECT)
    .setVersion('1.0')
    .build();

  app.enableCors();
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.getOrThrow<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { allowXhrOnlyMiddleware } from './allow-xhr-only.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(helmet());
  app.use(cookieParser());
  app.use(allowXhrOnlyMiddleware);

  app.enableCors({
    origin: configService.get<string[]>('cors.origins'),
  });

  const config = new DocumentBuilder()
    .setTitle('UCenter API')
    .setDescription('UCenter API testing branch')
    .setVersion('1.0')
    .addCookieAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>('app.port'));
}

bootstrap();

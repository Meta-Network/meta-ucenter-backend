import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from 'nestjs-general-interceptor';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from 'src/config/config.service';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const microserviceOptions = configService.get<MicroserviceOptions>(
    'microservice.options',
  );
  app.connectMicroservice<MicroserviceOptions>(microserviceOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  // after set this option we can know the requested protocol is https or http
  // for 'social-auth' callback method to keep the protocol
  app.set('trust proxy');

  app.use(helmet());
  app.use(cookieParser());

  let corsOrigins: boolean | string[] =
    configService.get<string[]>('cors.origins');
  if (corsOrigins.includes('*')) {
    corsOrigins = true;
  }
  app.enableCors({
    methods: 'POST, PUT, GET, OPTIONS, DELETE, PATCH, HEAD',
    origin: corsOrigins,
    credentials: true,
  });

  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('UCenter API')
      .setDescription('UCenter API testing branch')
      .setVersion('1.0')
      .addCookieAuth('ucenter_access_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  await app.startAllMicroservices();
  await app.listen(configService.get<string>('app.port'));
}

bootstrap();

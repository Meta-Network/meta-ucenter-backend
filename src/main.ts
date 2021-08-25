import { NestFactory } from '@nestjs/core';
import { NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from 'nestjs-general-interceptor';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from 'src/config/config.service';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import formCors from 'form-cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  app.use(helmet());
  app.use(cookieParser());
  app.use(
    formCors({
      allowList: configService.get<string[]>('cors.origins'),
      exception: new NotAcceptableException('This request is not allowed.'),
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors({
    methods: '*',
    origin: configService.get<string[]>('cors.origins'),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('UCenter API')
    .setDescription('UCenter API testing branch')
    .setVersion('1.0')
    .addCookieAuth('ucenter_access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(configService.get<string>('app.port'));
}

bootstrap();

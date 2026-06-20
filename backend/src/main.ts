import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 后端服务已启动: http://localhost:${port}`);
  console.log(`📊 API 文档: http://localhost:${port}/api`);
}

bootstrap();

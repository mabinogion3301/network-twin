import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Em produção, defina FRONTEND_URL (ex: https://seu-frontend.vercel.app)
  // para restringir CORS só ao seu domínio. Sem essa variável, libera tudo
  // (conveniente em desenvolvimento, mas defina em produção por segurança).
  app.enableCors({ origin: process.env.FRONTEND_URL || '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Network Twin API rodando em http://localhost:${port}/api`);
}

bootstrap();

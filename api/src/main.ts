import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les champs non déclarés dans les DTOs
      forbidNonWhitelisted: true,
      transform: true, // Transforme automatiquement les types (string → number etc.)
    }),
  );

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim());

  // CORS pour le dashboard Angular
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 La Turbine API running on http://localhost:${port}`);
}

bootstrap();

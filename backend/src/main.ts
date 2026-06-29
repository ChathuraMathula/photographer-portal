import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import fs from 'fs';

// Load local .env variables
const envPath = join(process.cwd(), '.env');
if (
  fs.existsSync(envPath) &&
  typeof (process as any).loadEnvFile === 'function'
) {
  (process as any).loadEnvFile(envPath);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:4000',
      'http://127.0.0.1:4000',
      'http://localhost:4000',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4001);
}

bootstrap();

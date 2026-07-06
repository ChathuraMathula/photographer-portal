import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
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
  app.enableShutdownHooks();
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

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'notifications_queue',
      prefetchCount: 10,
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 4001);
}

bootstrap();

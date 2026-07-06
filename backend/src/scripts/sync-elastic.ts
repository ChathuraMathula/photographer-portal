import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AnalyticsSyncService } from '../reports/analytics-sync.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Starting Elastic sync...');
  const syncService = app.get(AnalyticsSyncService);
  await syncService.bulkSyncAll();
  console.log('Done.');
  await app.close();
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { seedDemoData } from './seed-demo-data';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n🌱 Starting Demo Database Seed for Supun Kanishka (supunkanishka@photoportal.com)\n',
  );

  try {
    await seedDemoData(app);
    console.log(
      '✅ Demo database seeding completed successfully.\n',
    );
  } catch (err) {
    console.error('\n❌ Demo seeding failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

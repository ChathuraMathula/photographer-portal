import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { seedDatabase } from './seed-data.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n🌱  Starting database seed (idempotent — safe to run multiple times)\n',
  );

  try {
    await seedDatabase(app);
    console.log('\n✅  Seeding complete.\n');
  } catch (err) {
    console.error('\n❌  Seeding failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

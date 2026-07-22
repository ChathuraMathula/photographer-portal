import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { seedProdData } from './seed-prod-data.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n🌱 Starting production database seed (Super Admin only)\n',
  );

  try {
    await seedProdData(app);
    console.log('\n✅ Production seeding complete.\n');
  } catch (err) {
    console.error('\n❌ Production seeding failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { seedSarahData } from './seed-sarah-data';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n🌱 Starting separate database seed for Sarah Johnson (sarah@photoportal.com)\n',
  );

  try {
    await seedSarahData(app);
    console.log(
      '\n✅ Sarah Johnson database seeding completed successfully.\n',
    );
  } catch (err) {
    console.error('\n❌ Sarah Johnson seeding failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

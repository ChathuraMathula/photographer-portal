import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedProdData } from './scripts/seed-prod-data';
import { resetRabbitMQ } from './scripts/reset-rabbitmq';
import { resetMailDev } from './scripts/reset-maildev';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n⚠️   PRODUCTION DATABASE RESET — dropping all tables and re-seeding Super Admin\n',
  );

  try {
    const dataSource = app.get(DataSource);

    console.log('  🗑  Dropping database tables...');
    await dataSource.dropDatabase();
    console.log('  ✔ Database dropped');

    console.log('  🛠  Synchronizing database schema...');
    await dataSource.synchronize();
    console.log('  ✔ Schema synchronized');

    console.log('🌱  Seeding Super Admin user...\n');
    await seedProdData(app);

    console.log('\n  🐰  Resetting RabbitMQ message broker...');
    await resetRabbitMQ();

    console.log('\n  📧  Clearing MailDev inbox...');
    await resetMailDev();

    console.log('\n✅  Production database reset complete. Fresh Super Admin data ready.\n');
  } catch (err) {
    console.error('\n❌  Production reset failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

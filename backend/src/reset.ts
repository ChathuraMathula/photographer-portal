import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { seedDatabase } from './scripts/seed-data';

async function bootstrap() {
  const dbHost = process.env.DB_HOST ?? 'localhost';

  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n⚠️   DATABASE RESET — all tables will be dropped and re-seeded\n',
  );

  try {
    const dataSource = app.get(DataSource);

    console.log('  🗑  Dropping database tables...');
    await dataSource.dropDatabase();
    console.log('  ✔ Database dropped');

    console.log('  🛠  Synchronizing database schema...');
    await dataSource.synchronize();
    console.log('  ✔ Schema synchronized');

    console.log('🌱  Re-seeding...\n');
    await seedDatabase(app);

    console.log('\n✅  Reset complete. Fresh PostgreSQL data is ready.\n');
  } catch (err) {
    console.error('\n❌  Reset failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

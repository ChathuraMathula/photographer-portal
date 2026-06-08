/**
 * DB Reset Script  —  dev/staging only
 *
 * Drops every collection in the database, then re-seeds fresh data.
 *
 * Usage:  npm run db:reset
 */
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from './app.module';
import { seedDatabase } from './scripts/seed-data';

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI ?? '';
  if (mongoUri.includes('prod') || mongoUri.includes('atlas')) {
    console.error(
      '🚨  REFUSED: MONGODB_URI looks like a production database.\n' +
        '    Set MONGODB_URI to a local/staging URI before running db:reset.',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  console.log(
    '\n⚠️   DATABASE RESET — all data will be erased and re-seeded\n',
  );

  try {
    // connection.dropDatabase() is a first-class Mongoose method.
    // It avoids accessing connection.db directly, which may be undefined
    // on Mongoose 9 before the driver is fully ready.
    const connection = app.get<Connection>(getConnectionToken());
    await connection.dropDatabase();
    console.log('  🗑  Database dropped\n');

    console.log('🌱  Re-seeding...\n');
    await seedDatabase(app);

    console.log('\n✅  Reset complete. Fresh data is ready.\n');
  } catch (err) {
    console.error('\n❌  Reset failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();

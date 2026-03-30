import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  // Create a standalone NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get the Mongoose User model directly from the Nest DI container
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  console.log('🌱 Starting database seeding...');

  // Check if a super admin already exists
  const existingAdmin = await userModel.findOne({ role: UserRole.SUPER_ADMIN });

  if (existingAdmin) {
    console.log('✅ Super Admin already exists. Skipping initialization.');
  } else {
    // Create the initial Super Admin
    const saltRounds = 10;
    const defaultPassword = 'SuperSecretPassword123!'; // Change this in production!
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    await userModel.create({
      firstName: 'System',
      lastName: 'SuperAdmin',
      email: 'admin@photoportal.com',
      passwordHash: passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });

    console.log('🚀 Successfully created initial Super Admin!');
    console.log('Email: admin@photoportal.com');
    console.log(`Password: ${defaultPassword}`);
  }

  // Close the application context
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed', err);
  process.exit(1);
});

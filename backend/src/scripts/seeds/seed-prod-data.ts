import { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';

export async function seedProdData(
  app: INestApplicationContext,
): Promise<void> {
  const dataSource = app.get(DataSource);
  const manager = dataSource.manager;

  console.log('  🗑  Clearing existing database tables...');
  await dataSource.query(
    'TRUNCATE TABLE messages, payments, reservations, packages, photographer_profiles, customers, users, audit_logs CASCADE;',
  );

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@photoportal.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecret123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  console.log('  👤 Creating Super Admin user...');
  const superAdmin = manager.create(User, {
    firstName: 'Chathura',
    lastName: 'Mathula',
    email: adminEmail,
    passwordHash,
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    phone: '+94112345678',
  });

  await manager.save(User, superAdmin);
  console.log(`  ✔ Super Admin created: ${superAdmin.email}`);
}

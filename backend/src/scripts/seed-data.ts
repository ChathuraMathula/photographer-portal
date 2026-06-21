import { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../entities/user.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Package } from '../entities/package.entity';
import { Message } from '../entities/message.entity';

const tok = () => crypto.randomBytes(32).toString('hex');

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  // Ensure date is formatted as 'YYYY-MM-DD' for safe insertion into Postgres Date column
  return d;
};

export async function seedDatabase(
  app: INestApplicationContext,
): Promise<void> {
  const dataSource = app.get(DataSource);
  const manager = dataSource.manager;

  console.log('  🗑  Clearing old tables...');
  await dataSource.query(
    'TRUNCATE TABLE messages, reservations, packages, photographer_profiles, customers, users CASCADE;',
  );

  const hash = await bcrypt.hash('Photographer123!', 10);

  // ── 1. Super Admin ──────────────────────────────────────────────────────────
  const admin = manager.create(User, {
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@photoportal.com',
    passwordHash: await bcrypt.hash('SuperSecret123!', 10),
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    phone: '+94112345678',
  });
  await manager.save(User, admin);
  console.log('  ✔ Super Admin  →  admin@photoportal.com / SuperSecret123!');

  // ── 2. Standard Admin ────────────────────────────────────────────────────────
  const standardAdmin = manager.create(User, {
    firstName: 'Agency',
    lastName: 'Admin',
    email: 'agency@photoportal.com',
    passwordHash: await bcrypt.hash('AdminSecret123!', 10),
    role: UserRole.ADMIN,
    isActive: true,
    phone: '+94118765432',
  });
  await manager.save(User, standardAdmin);
  console.log('  ✔ Standard Admin → agency@photoportal.com / AdminSecret123!');

  // ── 3. Photographers ────────────────────────────────────────────────────────
  const sarahUser = manager.create(User, {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@photoportal.com',
    passwordHash: hash,
    role: UserRole.PHOTOGRAPHER,
    isActive: true,
    phone: '+94771234567',
  });
  await manager.save(User, sarahUser);

  const sarahProfile = manager.create(PhotographerProfile, {
    userId: sarahUser.id,
    bookingSlug: 'sarah-johnson',
    bio: 'Wedding & portrait photographer with 8 years of experience.',
    specializations: ['Wedding', 'Portrait', 'Engagement'],
    portfolioUrl: 'https://sarahjohnsonphoto.com',
    baseLocation: 'Colombo',
    isAvailableForBooking: true,
  });
  await manager.save(PhotographerProfile, sarahProfile);
  console.log('  ✔ Photographer Sarah Johnson → sarah@photoportal.com');

  const michaelUser = manager.create(User, {
    firstName: 'Michael',
    lastName: 'Fernando',
    email: 'michael@photoportal.com',
    passwordHash: hash,
    role: UserRole.PHOTOGRAPHER,
    isActive: true,
    phone: '+94779876543',
  });
  await manager.save(User, michaelUser);

  const michaelProfile = manager.create(PhotographerProfile, {
    userId: michaelUser.id,
    bookingSlug: 'michael-fernando',
    bio: 'Corporate and events specialist.',
    specializations: ['Corporate Event', 'Conference', 'Product Launch'],
    portfolioUrl: 'https://michaelfernandophoto.com',
    baseLocation: 'Kandy',
    isAvailableForBooking: true,
  });
  await manager.save(PhotographerProfile, michaelProfile);
  console.log('  ✔ Photographer Michael Fernando → michael@photoportal.com');

  // ── 4. Packages ────────────────────────────────────────────────────────────
  const sarahPkg1 = manager.create(Package, {
    photographerId: sarahUser.id,
    name: 'Basic Portrait Session',
    description: '1 hour outdoor portrait shoot with 15 edited high-res digital photos.',
    priceInCents: 2000000, // 20,000 LKR
    durationHours: 1,
    includes: ['1 Hour Shoot', '15 Edited Photos', 'Online Gallery'],
    isActive: true,
  });
  await manager.save(Package, sarahPkg1);

  const sarahPkg2 = manager.create(Package, {
    photographerId: sarahUser.id,
    name: 'Gold Wedding Package',
    description: 'Full day coverage, 2 photographers, photobook and 300+ edited digital copies.',
    priceInCents: 18500000, // 185,000 LKR
    durationHours: 8,
    includes: ['8 Hours Coverage', '2 Photographers', 'Photobook', '300+ Edited Photos'],
    isActive: true,
  });
  await manager.save(Package, sarahPkg2);

  const michaelPkg1 = manager.create(Package, {
    photographerId: michaelUser.id,
    name: 'Half-Day Event Coverage',
    description: '4 hours event photography for seminars, parties, or corporate launches.',
    priceInCents: 5000000, // 50,000 LKR
    durationHours: 4,
    includes: ['4 Hours Coverage', 'Online Gallery', 'All Raw Photos', '50 Edited Photos'],
    isActive: true,
  });
  await manager.save(Package, michaelPkg1);
  console.log('  ✔ 3 packages created');

  // ── 5. Customers ────────────────────────────────────────────────────────────
  const priya = manager.create(Customer, {
    firstName: 'Priya',
    lastName: 'Perera',
    email: 'priya@example.com',
    phone: '+94771110001',
    address: '12 Galle Road, Colombo 03',
  });
  await manager.save(Customer, priya);

  const david = manager.create(Customer, {
    firstName: 'David',
    lastName: 'Rajapaksa',
    email: 'david@example.com',
    phone: '+94772220002',
  });
  await manager.save(Customer, david);

  const amali = manager.create(Customer, {
    firstName: 'Amali',
    lastName: 'Silva',
    email: 'amali@example.com',
    phone: '+94773330003',
  });
  await manager.save(Customer, amali);
  console.log('  ✔ 3 Customers created');

  // ── 6. Reservations ─────────────────────────────────────────────────────────
  const res1Token = tok();
  const res1 = manager.create(Reservation, {
    customerId: priya.id,
    photographerId: sarahUser.id,
    date: daysFromNow(30),
    startTime: '16:00',
    endTime: '22:00',
    eventType: 'Wedding',
    location: 'Cinnamon Grand, Colombo',
    status: ReservationStatus.CONFIRMED,
    reservationToken: res1Token,
    customerNotes: 'Beach ceremony at 4pm, reception at 7pm.',
    advancePaymentPriceInCents: 5000000,
    clientSelectedPackageId: sarahPkg2.id,
    selectedPackages: [sarahPkg2],
  });
  await manager.save(Reservation, res1);

  const res2Token = tok();
  const res2 = manager.create(Reservation, {
    customerId: david.id,
    photographerId: michaelUser.id,
    date: daysFromNow(7),
    startTime: '09:00',
    endTime: '13:00',
    eventType: 'Corporate Event',
    location: 'Galadari Hotel, Colombo',
    status: ReservationStatus.PENDING,
    reservationToken: res2Token,
    customerNotes: 'Annual tech conference, ~200 attendees.',
  });
  await manager.save(Reservation, res2);

  const res3Token = tok();
  const res3 = manager.create(Reservation, {
    customerId: amali.id,
    photographerId: sarahUser.id,
    date: daysFromNow(14),
    startTime: '08:00',
    endTime: '10:00',
    eventType: 'Portrait',
    location: 'Viharamahadevi Park, Colombo',
    status: ReservationStatus.PENDING,
    reservationToken: res3Token,
    customerNotes: 'Outdoor session, prefer morning light.',
  });
  await manager.save(Reservation, res3);

  const res4Token = tok();
  const res4 = manager.create(Reservation, {
    customerId: priya.id,
    photographerId: michaelUser.id,
    date: daysFromNow(-30),
    startTime: '10:00',
    endTime: '18:00',
    eventType: 'Corporate Event',
    location: 'Hilton Colombo',
    status: ReservationStatus.COMPLETED,
    reservationToken: res4Token,
    adminNotes: 'Gallery delivered. Client satisfied.',
  });
  await manager.save(Reservation, res4);
  console.log('  ✔ 4 sample reservations created');

  // ── 7. Chat Messages ────────────────────────────────────────────────────────
  // We'll seed a quick negotiation thread for Priya's pending reservation
  const msg1 = manager.create(Message, {
    reservationId: res3.id,
    sender: 'CUSTOMER',
    senderName: 'Amali Silva',
    content: 'Hi Sarah, is it possible to shift the shoot by 1 hour to start at 09:00 instead of 08:00?',
  });
  await manager.save(Message, msg1);

  const msg2 = manager.create(Message, {
    reservationId: res3.id,
    sender: 'PHOTOGRAPHER',
    senderName: 'Sarah Johnson',
    content: 'Hi Amali, yes that should be fine. I will check my schedule and update the reservation details. In the meantime, I am sending over our Portrait package options for you to choose.',
  });
  await manager.save(Message, msg2);

  console.log('  ✔ Seeded sample chat messages');
}

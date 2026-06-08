import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../schemas/user.schema';
import { Customer } from '../schemas/customer.schema';
import { Reservation, ReservationStatus } from '../schemas/reservation.schema';
import { PhotographerProfile } from '../schemas/photographer-profile.schema';

const tok = () => crypto.randomBytes(32).toString('hex');

// Date helpers
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export async function seedDatabase(
  app: INestApplicationContext,
): Promise<void> {
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const customerModel = app.get<Model<Customer>>(getModelToken(Customer.name));
  const reservationModel = app.get<Model<Reservation>>(
    getModelToken(Reservation.name),
  );
  const profileModel = app.get<Model<PhotographerProfile>>(
    getModelToken(PhotographerProfile.name),
  );

  // ── 1. Super Admin ──────────────────────────────────────────────────────────
  const existingAdmin = await userModel.findOne({ role: UserRole.SUPER_ADMIN });
  if (!existingAdmin) {
    await userModel.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@photoportal.com',
      passwordHash: await bcrypt.hash('SuperSecret123!', 10),
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      phone: '+94112345678',
    });
    console.log('  ✔ Super Admin  →  admin@photoportal.com / SuperSecret123!');
  } else {
    console.log('  · Super Admin already exists — skipped');
  }

  // ── 2. Photographers ────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Photographer123!', 10);

  let sarahUser = await userModel.findOne({ email: 'sarah@photoportal.com' });
  if (!sarahUser) {
    sarahUser = await userModel.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@photoportal.com',
      passwordHash: hash,
      role: UserRole.PHOTOGRAPHER,
      isActive: true,
      phone: '+94771234567',
    });
    await profileModel.create({
      userId: sarahUser._id,
      bookingSlug: 'sarah-johnson',
      bio: 'Wedding & portrait photographer with 8 years of experience.',
      specializations: ['Wedding', 'Portrait', 'Engagement'],
      portfolioUrl: 'https://sarahjohnsonphoto.com',
      baseLocation: 'Colombo',
      isAvailableForBooking: true,
    });
    console.log(
      '  ✔ Photographer Sarah Johnson  →  sarah@photoportal.com / Photographer123!',
    );
    console.log('    Booking link: /book/sarah-johnson');
  } else {
    console.log('  · Sarah Johnson already exists — skipped');
  }

  let michaelUser = await userModel.findOne({
    email: 'michael@photoportal.com',
  });
  if (!michaelUser) {
    michaelUser = await userModel.create({
      firstName: 'Michael',
      lastName: 'Fernando',
      email: 'michael@photoportal.com',
      passwordHash: hash,
      role: UserRole.PHOTOGRAPHER,
      isActive: true,
      phone: '+94779876543',
    });
    await profileModel.create({
      userId: michaelUser._id,
      bookingSlug: 'michael-fernando',
      bio: 'Corporate and events specialist.',
      specializations: ['Corporate Event', 'Conference', 'Product Launch'],
      portfolioUrl: 'https://michaelfernandophoto.com',
      baseLocation: 'Kandy',
      isAvailableForBooking: true,
    });
    console.log(
      '  ✔ Photographer Michael Fernando  →  michael@photoportal.com / Photographer123!',
    );
    console.log('    Booking link: /book/michael-fernando');
  } else {
    console.log('  · Michael Fernando already exists — skipped');
  }

  // ── 3. Customers ────────────────────────────────────────────────────────────
  // Customers never log in — records are created when they submit a booking.

  let priya = await customerModel.findOne({ email: 'priya@example.com' });
  if (!priya) {
    priya = await customerModel.create({
      firstName: 'Priya',
      lastName: 'Perera',
      email: 'priya@example.com',
      phone: '+94771110001',
      address: '12 Galle Road, Colombo 03',
    });
    console.log('  ✔ Customer Priya Perera');
  }

  let david = await customerModel.findOne({ email: 'david@example.com' });
  if (!david) {
    david = await customerModel.create({
      firstName: 'David',
      lastName: 'Rajapaksa',
      email: 'david@example.com',
      phone: '+94772220002',
    });
    console.log('  ✔ Customer David Rajapaksa');
  }

  let amali = await customerModel.findOne({ email: 'amali@example.com' });
  if (!amali) {
    amali = await customerModel.create({
      firstName: 'Amali',
      lastName: 'Silva',
      email: 'amali@example.com',
      phone: '+94773330003',
    });
    console.log('  ✔ Customer Amali Silva');
  }

  // ── 4. Reservations ─────────────────────────────────────────────────────────
  const existing = await reservationModel.countDocuments();
  if (existing > 0) {
    console.log(`  · ${existing} reservation(s) already exist — skipped`);
    return;
  }

  // Re-query photographers after potential creation above to ensure IDs are fresh
  // Using non-null assertion (!) because we guaranteed creation above in this same run.
  const sarah =
    sarahUser ?? (await userModel.findOne({ email: 'sarah@photoportal.com' }))!;
  const michael =
    michaelUser ??
    (await userModel.findOne({ email: 'michael@photoportal.com' }))!;

  await reservationModel.insertMany([
    {
      customerId: priya!._id,
      photographerId: sarah._id,
      date: daysFromNow(30),
      startTime: '16:00',
      endTime: '22:00',
      eventType: 'Wedding',
      location: 'Cinnamon Grand, Colombo',
      status: ReservationStatus.CONFIRMED,
      reservationToken: tok(),
      customerNotes: 'Beach ceremony at 4pm, reception at 7pm.',
    },
    {
      customerId: david!._id,
      photographerId: michael._id,
      date: daysFromNow(7),
      startTime: '09:00',
      endTime: '13:00',
      eventType: 'Corporate Event',
      location: 'Galadari Hotel, Colombo',
      status: ReservationStatus.PENDING,
      reservationToken: tok(),
      customerNotes: 'Annual tech conference, ~200 attendees.',
    },
    {
      customerId: amali!._id,
      photographerId: sarah._id,
      date: daysFromNow(14),
      startTime: '08:00',
      endTime: '10:00',
      eventType: 'Portrait',
      location: 'Viharamahadevi Park, Colombo',
      status: ReservationStatus.PENDING,
      reservationToken: tok(),
      customerNotes: 'Outdoor session, prefer morning light.',
    },
    {
      customerId: priya!._id,
      photographerId: michael._id,
      date: daysFromNow(-30),
      startTime: '10:00',
      endTime: '18:00',
      eventType: 'Corporate Event',
      location: 'Hilton Colombo',
      status: ReservationStatus.COMPLETED,
      reservationToken: tok(),
      adminNotes: 'Gallery delivered. Client satisfied.',
    },
  ]);

  console.log('  ✔ 4 sample reservations created');
}

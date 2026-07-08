import { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../entities/user.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Package } from '../entities/package.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';

const tok = () => crypto.randomBytes(32).toString('hex');

const lankanFirstNames = [
  'Priyantha',
  'Kanishka',
  'Nuwan',
  'Chathura',
  'Dilshan',
  'Ruwan',
  'Sajith',
  'Tharindu',
  'Roshan',
  'Suresh',
  'Amila',
  'Nilanka',
  'Sandun',
  'Chamara',
  'Dinesh',
  'Indika',
  'Manoj',
  'Anushka',
  'Pathum',
  'Gayan',
  'Priya',
  'Amali',
  'Sanduni',
  'Nadeesha',
  'Dilhani',
  'Nilmini',
  'Kanchana',
  'Shenali',
  'Kavindi',
  'Hiruni',
  'Hashini',
  'Tharushi',
  'Udari',
  'Sachini',
  'Hansini',
  'Yashodha',
  'Oshadi',
  'Devni',
  'Maneesha',
  'Oshini',
];

const lankanLastNames = [
  'Perera',
  'Fernando',
  'Silva',
  'Jayasinghe',
  'Wijewardene',
  'Gunasekara',
  'Alwis',
  'Ratnayake',
  'Cooray',
  'Liyanage',
  'Wickramasinghe',
  'Jayawardena',
  'Senanayake',
  'Rajapakse',
  'Premadasa',
  'Goonetilleke',
  'Disanayaka',
  'Herath',
  'Samaraweera',
  'Karunaratne',
  'Ranasinghe',
  'Mendis',
  'Rodrigo',
  'Peiris',
  'Fonseka',
  'Amarasinghe',
];

const eventTypes = [
  'Wedding',
  'Portrait',
  'Engagement',
  'Corporate Event',
  'Newborn',
  'Maternity',
];

const cities = [
  { name: 'Colombo', district: 'Colombo', lat: 6.9271, lon: 79.8612 },
  { name: 'Kandy', district: 'Kandy', lat: 7.2906, lon: 80.6337 },
  { name: 'Galle', district: 'Galle', lat: 6.0535, lon: 80.221 },
  { name: 'Negombo', district: 'Gampaha', lat: 7.2008, lon: 79.8737 },
  { name: 'Bentota', district: 'Galle', lat: 6.4285, lon: 79.9997 },
  { name: 'Hikkaduwa', district: 'Galle', lat: 6.1396, lon: 80.1063 },
  { name: 'Nuwara Eliya', district: 'Nuwara Eliya', lat: 6.9497, lon: 80.7828 },
  { name: 'Kurunegala', district: 'Kurunegala', lat: 7.4818, lon: 80.3609 },
  { name: 'Matara', district: 'Matara', lat: 5.9549, lon: 80.5469 },
  { name: 'Kalutara', district: 'Kalutara', lat: 6.5854, lon: 79.9607 },
];

export async function seedSarahData(
  app: INestApplicationContext,
): Promise<void> {
  const dataSource = app.get(DataSource);
  const manager = dataSource.manager;

  console.log('🔍 Checking if Sarah exists in system...');
  let sarah = await manager.findOne(User, {
    where: { email: 'sarah@photoportal.com' },
  });

  const hash = await bcrypt.hash('Photographer123!', 10);

  if (!sarah) {
    console.log('Sarah not found. Creating Sarah user account...');
    sarah = manager.create(User, {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@photoportal.com',
      passwordHash: hash,
      role: UserRole.PHOTOGRAPHER,
      isActive: true,
      phone: '+94771234567',
    });
    await manager.save(User, sarah);

    const profile = manager.create(PhotographerProfile, {
      userId: sarah.id,
      bookingSlug: 'sarah-johnson',
      bio: 'Wedding and portrait specialist. Capturing beautiful stories across Sri Lanka.',
      specializations: ['Wedding', 'Portrait', 'Engagement', 'Maternity'],
      portfolioUrl: 'https://sarahjohnson.photo.lk',
      baseLocation: 'Colombo',
      isAvailableForBooking: true,
    });
    await manager.save(PhotographerProfile, profile);
  }

  console.log(`Sarah Johnson ID: ${sarah.id}`);

  // Delete Sarah's old reservations/payments/messages (Safe cascade)
  console.log('🧹 Cleaning old reservations for Sarah...');
  await manager.delete(Reservation, { photographerId: sarah.id });

  // Ensure Sarah has packages
  console.log("📦 Setting up Sarah's core packages...");
  let sarahPackages = await manager.find(Package, {
    where: { photographerId: sarah.id },
  });
  if (sarahPackages.length === 0) {
    const defaultPackages = [
      {
        name: 'Basic Portrait Session',
        desc: '1 hour outdoor session.',
        price: 1500000,
        duration: 1,
        specs: ['Portrait'],
      },
      {
        name: 'Gold Wedding Day',
        desc: 'Full wedding day coverage.',
        price: 18500000,
        duration: 8,
        specs: ['Wedding'],
      },
      {
        name: 'Premium Engagement',
        desc: 'Beautiful pre-wedding couple shoot.',
        price: 4500000,
        duration: 3,
        specs: ['Engagement'],
      },
      {
        name: 'Luxury Maternity Shoot',
        desc: 'Pre-birth outdoor and studio photos.',
        price: 3500000,
        duration: 2,
        specs: ['Maternity'],
      },
    ];

    for (const pkg of defaultPackages) {
      const dbPkg = manager.create(Package, {
        photographerId: sarah!.id,
        name: pkg.name,
        description: pkg.desc,
        priceInCents: pkg.price,
        durationHours: pkg.duration,
        includes: [
          'High Resolution Digital Downloads',
          'Professional Retouching',
          'Online Gallery',
        ],
        isActive: true,
        depositType: 'percentage',
        depositValue: 20,
      });
      await manager.save(Package, dbPkg);
    }
    sarahPackages = await manager.find(Package, {
      where: { photographerId: sarah.id },
    });
  }

  // Create 100 Sri Lankan customers
  console.log('👥 Seeding Sri Lankan test customers...');
  const customers: Customer[] = [];
  for (let i = 0; i < 100; i++) {
    const first =
      lankanFirstNames[Math.floor(Math.random() * lankanFirstNames.length)];
    const last =
      lankanLastNames[Math.floor(Math.random() * lankanLastNames.length)];
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${i}@example.com`;

    // Check if customer already exists
    let customer = await manager.findOne(Customer, { where: { email } });
    if (!customer) {
      customer = manager.create(Customer, {
        firstName: first,
        lastName: last,
        email,
        phone: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
        address: `${Math.floor(1 + Math.random() * 120)} Main Road, ${cities[Math.floor(Math.random() * cities.length)].name}`,
      });
      await manager.save(Customer, customer);
    }
    customers.push(customer);
  }

  // Generating Reservations across years 2024, 2025, 2026, 2027
  console.log(
    '📅 Generating years of non-colliding reservations & payments...',
  );
  const years = [2024, 2025, 2026, 2027];
  const currentDate = new Date();

  let reservationCount = 0;
  let paymentCount = 0;

  // Let's seed 15 non-colliding reservations per month.
  // We place at most 1 reservation per day, on days 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 28
  const daysOfEvent = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 28];

  for (const year of years) {
    for (let month = 0; month < 12; month++) {
      for (const day of daysOfEvent) {
        const eventDate = new Date(year, month, day);
        const isPast = eventDate < currentDate;

        // Randomly pick customer, package, and event type
        const customer =
          customers[Math.floor(Math.random() * customers.length)];
        const pkg =
          sarahPackages[Math.floor(Math.random() * sarahPackages.length)];
        const eventType =
          eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const cityObj = cities[Math.floor(Math.random() * cities.length)];

        // Set status
        let status = ReservationStatus.COMPLETED;
        if (!isPast) {
          const rand = Math.random();
          if (year === 2027) {
            status =
              rand < 0.4
                ? ReservationStatus.CONFIRMED
                : rand < 0.7
                  ? ReservationStatus.PENDING
                  : rand < 0.9
                    ? ReservationStatus.PROPOSED
                    : ReservationStatus.CANCELLED;
          } else {
            status =
              rand < 0.7
                ? ReservationStatus.CONFIRMED
                : rand < 0.85
                  ? ReservationStatus.PENDING
                  : ReservationStatus.PROPOSED;
          }
        }

        // Reservation time slots
        const startTime = '09:00';
        const endTime =
          pkg.durationHours === 1
            ? '10:00'
            : pkg.durationHours === 2
              ? '11:00'
              : pkg.durationHours === 3
                ? '12:00'
                : '17:00';

        const totalAmountInCents = pkg.priceInCents;
        const advancePaymentPriceInCents = Math.round(totalAmountInCents * 0.2); // 20% advance

        const reservation = manager.create(Reservation, {
          photographerId: sarah.id,
          customerId: customer.id,
          date: eventDate,
          startTime,
          endTime,
          eventType,
          location: `${cityObj.name} Scenic Point`,
          locationMapLink: `https://maps.google.com/?q=${cityObj.lat + (Math.random() * 0.02 - 0.01)},${cityObj.lon + (Math.random() * 0.02 - 0.01)}`,
          city: cityObj.name,
          district: cityObj.district,
          customerNotes: `Excited for this ${eventType} shoot. Need professional lighting.`,
          totalAmountInCents,
          advancePaymentPriceInCents,
          status,
          reservationToken: `token_${tok()}`,
          clientSelectedPackageId: pkg.id,
          selectedPackages: [
            {
              id: pkg.id,
              name: pkg.name,
              priceInCents: pkg.priceInCents,
              durationHours: pkg.durationHours,
              description: pkg.description,
              includes: pkg.includes,
            },
          ],
          usePackageWiseDeposit: true,
          createdAt: new Date(eventDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          isRead: true,
        });

        await manager.save(Reservation, reservation);
        reservationCount++;

        // Add Payments for Confirmed/Completed Bookings
        if (
          status === ReservationStatus.CONFIRMED ||
          status === ReservationStatus.COMPLETED
        ) {
          const cardBrands = ['Visa', 'Mastercard', 'Amex', 'Offline Payment'];
          const cardBrand =
            cardBrands[Math.floor(Math.random() * cardBrands.length)];
          const cardLast4 =
            cardBrand === 'Offline Payment'
              ? 'Cash'
              : String(Math.floor(1000 + Math.random() * 9000));

          // 1. Advance Deposit Payment
          const depositDate = new Date(
            reservation.createdAt.getTime() + 1 * 24 * 60 * 60 * 1000,
          ); // 1 day after request
          const depositPayment = manager.create(Payment, {
            reservationId: reservation.id,
            amountInCents: advancePaymentPriceInCents,
            status: PaymentStatus.SUCCESS,
            transactionId: `ch_${crypto.randomUUID().slice(0, 18)}`,
            cardBrand,
            cardLast4,
            createdAt: depositDate,
          });
          await manager.save(Payment, depositPayment);
          paymentCount++;

          // 2. Final Balance Payment (if Completed)
          if (status === ReservationStatus.COMPLETED) {
            const finalPayment = manager.create(Payment, {
              reservationId: reservation.id,
              amountInCents: totalAmountInCents - advancePaymentPriceInCents,
              status: PaymentStatus.SUCCESS,
              transactionId: `ch_${crypto.randomUUID().slice(0, 18)}`,
              cardBrand,
              cardLast4,
              createdAt: eventDate,
            });
            await manager.save(Payment, finalPayment);
            paymentCount++;
          }
        }
      }
    }
  }

  console.log(`✅ Seeding for Sarah complete!`);
  console.log(`🎉 Created ${reservationCount} non-colliding reservations.`);
  console.log(`💳 Created ${paymentCount} payment transaction receipts.`);
}

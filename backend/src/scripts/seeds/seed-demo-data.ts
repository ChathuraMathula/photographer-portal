import { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../../entities/user.entity';
import { ServiceProfile, PhotographerProfile } from '../../entities/service-profile.entity';
import { Customer } from '../../entities/customer.entity';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { Package } from '../../entities/package.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

const randomToken = () => crypto.randomBytes(32).toString('hex');
const randomTxId = () => 'ch_demo_' + crypto.randomBytes(8).toString('hex');

const sriLankanCustomers = [
  { firstName: 'Kasun', lastName: 'Kalhara', email: 'kasun.k@gmail.com', phone: '+94771112233' },
  { firstName: 'Nimali', lastName: 'Perera', email: 'nimali.p@yahoo.com', phone: '+94712223344' },
  { firstName: 'Dinesh', lastName: 'Chandimal', email: 'dinesh.c@outlook.com', phone: '+94753334455' },
  { firstName: 'Shanika', lastName: 'Fernando', email: 'shanika.f@gmail.com', phone: '+94784445566' },
  { firstName: 'Roshan', lastName: 'Mahanama', email: 'roshan.m@gmail.com', phone: '+94705556677' },
  { firstName: 'Dilshan', lastName: 'Jayawardene', email: 'dilshan.j@gmail.com', phone: '+94726667788' },
  { firstName: 'Kanchana', lastName: 'Mendis', email: 'kanchana.m@yahoo.com', phone: '+94767778899' },
  { firstName: 'Pathum', lastName: 'Nissanka', email: 'pathum.n@gmail.com', phone: '+94718889900' },
  { firstName: 'Anushka', lastName: 'Sanjeewani', email: 'anushka.s@outlook.com', phone: '+94779990011' },
  { firstName: 'Tharindu', lastName: 'Kaushal', email: 'tharindu.k@gmail.com', phone: '+94750001122' },
  { firstName: 'Chamari', lastName: 'Athapaththu', email: 'chamari.a@gmail.com', phone: '+94781112233' },
  { firstName: 'Suresh', lastName: 'Raina', email: 'suresh.r@yahoo.com', phone: '+94702223344' },
  { firstName: 'Hiruni', lastName: 'Hansika', email: 'hiruni.h@gmail.com', phone: '+94723334455' },
  { firstName: 'Gayan', lastName: 'Pradeep', email: 'gayan.p@outlook.com', phone: '+94764445566' },
  { firstName: 'Sachini', lastName: 'Nipunsala', email: 'sachini.n@gmail.com', phone: '+94715556677' },
  { firstName: 'Ruwan', lastName: 'Kalpage', email: 'ruwan.k@gmail.com', phone: '+94776667788' },
  { firstName: 'Sanduni', lastName: 'Disanayaka', email: 'sanduni.d@yahoo.com', phone: '+94757778899' },
  { firstName: 'Amila', lastName: 'Aponso', email: 'amila.a@gmail.com', phone: '+94788889900' },
  { firstName: 'Yashodha', lastName: 'Lanka', email: 'yashodha.l@gmail.com', phone: '+94709990011' },
  { firstName: 'Kavindi', lastName: 'Ishara', email: 'kavindi.i@outlook.com', phone: '+94720001122' },
];

const locationsList = [
  {
    location: 'Cinnamon Grand Hotel, 77 Galle Rd, Colombo 03',
    city: 'Colombo',
    district: 'Colombo District',
    locationMapLink: 'https://www.google.com/maps?q=6.9174,79.8488',
  },
  {
    location: "Earl's Regency Hotel, Tennekumbura, Kandy",
    city: 'Kandy',
    district: 'Kandy District',
    locationMapLink: 'https://www.google.com/maps?q=7.2914,80.6654',
  },
  {
    location: 'Jetwing Lighthouse, Dadella, Galle',
    city: 'Galle',
    district: 'Galle District',
    locationMapLink: 'https://www.google.com/maps?q=6.0425,80.2032',
  },
  {
    location: 'Lakeside Hotel, Bauddhaloka Mawatha, Kurunegala',
    city: 'Kurunegala',
    district: 'Kurunegala District',
    locationMapLink: 'https://www.google.com/maps?q=7.4863,80.3647',
  },
  {
    location: 'The Thinnai, 186 Palali Rd, Jaffna',
    city: 'Jaffna',
    district: 'Jaffna District',
    locationMapLink: 'https://www.google.com/maps?q=9.6650,80.0093',
  },
  {
    location: 'Heritance Negombo, 175 Lewis Pl, Negombo',
    city: 'Negombo',
    district: 'Gampaha District',
    locationMapLink: 'https://www.google.com/maps?q=7.2285,79.8398',
  },
  {
    location: 'The Grand Hotel, 5 Grand Hotel Rd, Nuwara Eliya',
    city: 'Nuwara Eliya',
    district: 'Nuwara Eliya District',
    locationMapLink: 'https://www.google.com/maps?q=6.9678,80.7672',
  },
  {
    location: 'Trinco Blu by Cinnamon, Sampaltivu Post, Trincomalee',
    city: 'Trincomalee',
    district: 'Trincomalee District',
    locationMapLink: 'https://www.google.com/maps?q=8.5982,81.2185',
  },
  {
    location: 'Mandara Resort, Pelena, Mirissa, Matara',
    city: 'Matara',
    district: 'Matara District',
    locationMapLink: 'https://www.google.com/maps?q=5.9483,80.4578',
  },
  {
    location: 'Taj Bentota Resort & Spa, Galle Road, Bentota',
    city: 'Bentota',
    district: 'Galle District',
    locationMapLink: 'https://www.google.com/maps?q=6.4255,79.9961',
  },
];

export async function seedDemoData(app: INestApplicationContext) {
  const dataSource = app.get(DataSource);
  const manager = dataSource.manager;

  console.log('\n🧹 Clearing existing database tables...');
  await dataSource.query(
    'DROP TABLE IF EXISTS photographer_profiles CASCADE;',
  );
  await dataSource.query(
    'TRUNCATE TABLE messages, payments, reservations, packages, service_profiles, customers, users, audit_logs CASCADE;',
  );

  // 1. Create Super Admin
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@photoportal.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Welcome@123';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const superAdmin = manager.create(User, {
    firstName: 'Chamod',
    lastName: 'Madhusanka',
    email: adminEmail,
    passwordHash: adminHash,
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    phone: '+94701234567',
  });
  await manager.save(User, superAdmin);

  // 2. Create Photographer Supun Kanishka
  const supunEmail = 'supun@photoportal.com';
  const supunPassword = 'Welcome@123';
  const supunHash = await bcrypt.hash(supunPassword, 10);

  const supunUser = manager.create(User, {
    firstName: 'Supun',
    lastName: 'Kanishka',
    email: supunEmail,
    passwordHash: supunHash,
    role: UserRole.PHOTOGRAPHER,
    isActive: true,
    phone: '+94771234567',
  });
  await manager.save(User, supunUser);

  // 3. Create Photographer Profile for Supun Kanishka
  const profile = manager.create(PhotographerProfile, {
    userId: supunUser.id,
    bookingSlug: 'supun-kanishka',
    bio: 'Award-winning Sri Lankan professional photographer specializing in high-end Weddings, Birthdays, Portraits, and Corporate events across Sri Lanka.',
    baseLocation: 'Colombo 03, Western Province',
    city: 'Colombo',
    district: 'Colombo District',
    locationMapLink: 'https://www.google.com/maps?q=6.9174,79.8488',
    allowedEventTypes: ['Wedding', 'Birthday', 'Portrait', 'Event', 'Corporate', 'Engagement'],
    isAvailableForBooking: true,
    showManualBookingInTopbar: true,
    showAcceptBookingsInTopbar: true,
    universalDepositType: 'fixed',
    universalDepositValue: 1000000, // LKR 10,000 default deposit
    offlineMessage: '',
  });
  await manager.save(PhotographerProfile, profile);

  // 2b. Create Photographer Nuwan Thushara
  const nuwanEmail = 'nuwan@photoportal.com';
  const nuwanPassword = 'Welcome@123';
  const nuwanHash = await bcrypt.hash(nuwanPassword, 10);

  const nuwanUser = manager.create(User, {
    firstName: 'Nuwan',
    lastName: 'Thushara',
    email: nuwanEmail,
    passwordHash: nuwanHash,
    role: UserRole.PHOTOGRAPHER,
    isActive: true,
    phone: '+94779876543',
  });
  await manager.save(User, nuwanUser);

  // 3b. Create Photographer Profile for Nuwan Thushara
  const nuwanProfile = manager.create(PhotographerProfile, {
    userId: nuwanUser.id,
    bookingSlug: 'nuwan-thushara',
    bio: 'Experienced Destination Wedding & Cultural Event Photographer based in Kandy. Capturing timeless moments and heritage celebrations.',
    baseLocation: 'Kandy, Central Province',
    city: 'Kandy',
    district: 'Kandy District',
    locationMapLink: 'https://www.google.com/maps?q=7.2914,80.6654',
    allowedEventTypes: ['Wedding', 'Engagement', 'Portrait', 'Cultural Event', 'Pre-Wedding'],
    isAvailableForBooking: true,
    showManualBookingInTopbar: true,
    showAcceptBookingsInTopbar: true,
    universalDepositType: 'fixed',
    universalDepositValue: 1500000, // LKR 15,000 default deposit
    offlineMessage: '',
  });
  await manager.save(PhotographerProfile, nuwanProfile);

  // 4. Create Realistic Packages for Supun
  const pkgData = [
    {
      name: 'Wedding Platinum Package',
      description: 'Full-day luxury wedding coverage with 2 senior photographers, drone footage, 40-page printed album, and edited digital gallery.',
      priceInCents: 25000000, // LKR 250,000
      durationHours: 10,
      depositType: 'fixed',
      depositValue: 5000000, // LKR 50,000 deposit
      includes: ['2 Senior Photographers', 'Drone Shots', '40-Page Photobook', '300+ Retouched Photos'],
      isActive: true,
    },
    {
      name: 'Wedding Gold Package',
      description: 'Comprehensive wedding day coverage with 1 lead photographer & assistant. Includes high-res digital gallery.',
      priceInCents: 18000000, // LKR 180,000
      durationHours: 8,
      depositType: 'fixed',
      depositValue: 3500000, // LKR 35,000 deposit
      includes: ['1 Lead Photographer', '1 Assistant', 'Digital Album', '200+ Retouched Photos'],
      isActive: true,
    },
    {
      name: 'Corporate & Event Deluxe',
      description: 'Full event coverage for corporate functions, galas, and launch events with fast 48-hour delivery.',
      priceInCents: 9500000, // LKR 95,000
      durationHours: 5,
      depositType: 'fixed',
      depositValue: 2000000, // LKR 20,000 deposit
      includes: ['5 Hours Coverage', 'Commercial License', 'Online Gallery', 'Rapid Delivery'],
      isActive: true,
    },
    {
      name: 'Birthday & Celebration Special',
      description: 'Vibrant coverage of birthday parties, family get-togethers, and milestones.',
      priceInCents: 5000000, // LKR 50,000
      durationHours: 3,
      depositType: 'fixed',
      depositValue: 1000000, // LKR 10,000 deposit
      includes: ['3 Hours Coverage', '100+ Retouched Photos', 'Highlights Video Clip'],
      isActive: true,
    },
    {
      name: 'Studio & Outdoor Portrait Shoot',
      description: 'Individual, couple, or model portfolio session at an outdoor scenic location or studio.',
      priceInCents: 3000000, // LKR 30,000
      durationHours: 2,
      depositType: 'fixed',
      depositValue: 500000, // LKR 5,000 deposit
      includes: ['2 Hours Shoot', '20 Retouched High-Res Images', '2 Outfit Changes'],
      isActive: true,
    },
  ];

  const packages: Package[] = [];
  for (const p of pkgData) {
    const pkg = manager.create(Package, {
      ...p,
      photographerId: supunUser.id,
    });
    packages.push(await manager.save(Package, pkg));
  }

  // 4b. Create Packages for Nuwan Thushara
  const nuwanPkgData = [
    {
      name: 'Kandy Royal Wedding Package',
      description: 'Traditional & modern wedding photography coverage including homecoming & Poruwa ceremony with drone and photobook.',
      priceInCents: 22000000, // LKR 220,000
      durationHours: 12,
      depositType: 'fixed',
      depositValue: 4000000, // LKR 40,000
      includes: ['2 Main Photographers', 'Drone Coverage', 'Poruwa & Reception', '350 Retouched Photos'],
      isActive: true,
    },
    {
      name: 'Pre-Wedding Scenic Shoot',
      description: 'Cinematic pre-wedding portrait session at scenic Hill Country locations (Nuwara Eliya, Ella, Kandy).',
      priceInCents: 8500000, // LKR 85,000
      durationHours: 6,
      depositType: 'fixed',
      depositValue: 1500000, // LKR 15,000
      includes: ['Full Day Hill Country Locations', '150 Digital Photos', '3 Outfit Changes', 'Short Teaser Reel'],
      isActive: true,
    },
    {
      name: 'Heritage & Cultural Event Package',
      description: 'Specialized coverage for cultural functions, engagement ceremonies, and family gatherings.',
      priceInCents: 6000000, // LKR 60,000
      durationHours: 4,
      depositType: 'fixed',
      depositValue: 1000000, // LKR 10,000
      includes: ['4 Hours Coverage', '120 Edited Photos', 'Online Digital Gallery'],
      isActive: true,
    },
    {
      name: 'Express Portrait Shoot',
      description: 'Quick professional personal portrait session.',
      priceInCents: 2500000, // LKR 25,000
      durationHours: 2,
      depositType: 'fixed',
      depositValue: 500000, // LKR 5,000
      includes: ['2 Hours Shoot', '25 Retouched Images'],
      isActive: true,
    },
  ];

  const nuwanPackages: Package[] = [];
  for (const p of nuwanPkgData) {
    const pkg = manager.create(Package, {
      ...p,
      photographerId: nuwanUser.id,
    });
    nuwanPackages.push(await manager.save(Package, pkg));
  }

  // 5. Create Customers
  const customers: Customer[] = [];
  for (const c of sriLankanCustomers) {
    const cust = manager.create(Customer, {
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
    });
    customers.push(await manager.save(Customer, cust));
  }

  // 6. Generate Past & Future Reservations for Supun
  let totalCompleted = 0;
  let totalConfirmed = 0;
  let totalProposed = 0;
  let totalPending = 0;
  let totalRejected = 0;
  let totalCancelled = 0;
  let totalRevenueCents = 0;
  let totalPaymentsCount = 0;

  type ReservationSpec = {
    date: string;
    status: ReservationStatus;
    pkgIndex: number;
    locIndex: number;
    eventType: string;
    rejectionReason?: string;
  };

  // Past Reservations Schedule (2024 to 2026-07-23, yesterday)
  const pastReservationSpecs: ReservationSpec[] = [
    // 2024
    { date: '2024-01-15', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 0, eventType: 'Wedding' },
    { date: '2024-02-18', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 1, eventType: 'Wedding' },
    { date: '2024-03-10', status: ReservationStatus.COMPLETED, pkgIndex: 3, locIndex: 2, eventType: 'Birthday' },
    { date: '2024-04-05', status: ReservationStatus.REJECTED, pkgIndex: 0, locIndex: 3, eventType: 'Wedding', rejectionReason: 'Fully booked on date' },
    { date: '2024-05-20', status: ReservationStatus.COMPLETED, pkgIndex: 2, locIndex: 4, eventType: 'Corporate' },
    { date: '2024-06-14', status: ReservationStatus.COMPLETED, pkgIndex: 4, locIndex: 5, eventType: 'Portrait' },
    { date: '2024-07-22', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2024-08-11', status: ReservationStatus.CANCELLED, pkgIndex: 1, locIndex: 7, eventType: 'Wedding' },
    { date: '2024-09-08', status: ReservationStatus.COMPLETED, pkgIndex: 3, locIndex: 8, eventType: 'Birthday' },
    { date: '2024-10-15', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 9, eventType: 'Wedding' },
    { date: '2024-11-28', status: ReservationStatus.COMPLETED, pkgIndex: 2, locIndex: 0, eventType: 'Event' },
    { date: '2024-12-12', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
    
    // 2025
    { date: '2025-01-18', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 2, eventType: 'Wedding' },
    { date: '2025-02-14', status: ReservationStatus.COMPLETED, pkgIndex: 4, locIndex: 3, eventType: 'Portrait' },
    { date: '2025-03-25', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 4, eventType: 'Wedding' },
    { date: '2025-04-12', status: ReservationStatus.REJECTED, pkgIndex: 2, locIndex: 5, eventType: 'Corporate', rejectionReason: 'Out of region request' },
    { date: '2025-05-08', status: ReservationStatus.COMPLETED, pkgIndex: 3, locIndex: 6, eventType: 'Birthday' },
    { date: '2025-06-30', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 7, eventType: 'Wedding' },
    { date: '2025-07-15', status: ReservationStatus.COMPLETED, pkgIndex: 2, locIndex: 8, eventType: 'Corporate' },
    { date: '2025-08-20', status: ReservationStatus.CANCELLED, pkgIndex: 3, locIndex: 9, eventType: 'Birthday' },
    { date: '2025-09-14', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 0, eventType: 'Wedding' },
    { date: '2025-10-22', status: ReservationStatus.COMPLETED, pkgIndex: 4, locIndex: 1, eventType: 'Portrait' },
    { date: '2025-11-10', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 2, eventType: 'Wedding' },
    { date: '2025-12-24', status: ReservationStatus.COMPLETED, pkgIndex: 3, locIndex: 3, eventType: 'Birthday' },

    // 2026 (Jan - July 23)
    { date: '2026-01-10', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 4, eventType: 'Wedding' },
    { date: '2026-02-14', status: ReservationStatus.COMPLETED, pkgIndex: 4, locIndex: 5, eventType: 'Portrait' },
    { date: '2026-03-20', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 6, eventType: 'Wedding' },
    { date: '2026-04-18', status: ReservationStatus.REJECTED, pkgIndex: 0, locIndex: 7, eventType: 'Wedding', rejectionReason: 'Personal leave' },
    { date: '2026-05-12', status: ReservationStatus.COMPLETED, pkgIndex: 2, locIndex: 8, eventType: 'Corporate' },
    { date: '2026-06-08', status: ReservationStatus.COMPLETED, pkgIndex: 3, locIndex: 9, eventType: 'Birthday' },
    { date: '2026-07-04', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 0, eventType: 'Wedding' },
    { date: '2026-07-18', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
    { date: '2026-07-22', status: ReservationStatus.CANCELLED, pkgIndex: 4, locIndex: 2, eventType: 'Portrait' },
  ];

  // Future Reservations Schedule (July 26 to Late September 2026)
  const futureReservationSpecs: ReservationSpec[] = [
    { date: '2026-07-26', status: ReservationStatus.CONFIRMED, pkgIndex: 0, locIndex: 2, eventType: 'Wedding' },
    { date: '2026-07-29', status: ReservationStatus.PROPOSED, pkgIndex: 2, locIndex: 3, eventType: 'Corporate' },
    { date: '2026-08-02', status: ReservationStatus.PENDING, pkgIndex: 3, locIndex: 4, eventType: 'Birthday' },
    { date: '2026-08-08', status: ReservationStatus.CONFIRMED, pkgIndex: 1, locIndex: 5, eventType: 'Wedding' },
    { date: '2026-08-14', status: ReservationStatus.PROPOSED, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2026-08-20', status: ReservationStatus.PENDING, pkgIndex: 4, locIndex: 7, eventType: 'Portrait' },
    { date: '2026-08-28', status: ReservationStatus.CONFIRMED, pkgIndex: 2, locIndex: 8, eventType: 'Corporate' },
    { date: '2026-09-04', status: ReservationStatus.PROPOSED, pkgIndex: 1, locIndex: 9, eventType: 'Wedding' },
    { date: '2026-09-12', status: ReservationStatus.PENDING, pkgIndex: 3, locIndex: 0, eventType: 'Birthday' },
    { date: '2026-09-18', status: ReservationStatus.CONFIRMED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
    { date: '2026-09-25', status: ReservationStatus.PROPOSED, pkgIndex: 4, locIndex: 2, eventType: 'Portrait' },
  ];

  const allSpecs = [...pastReservationSpecs, ...futureReservationSpecs];

  for (let i = 0; i < allSpecs.length; i++) {
    const spec = allSpecs[i];
    const customer = customers[i % customers.length];
    const pkg = packages[spec.pkgIndex];
    const loc = locationsList[spec.locIndex];

    const res = manager.create(Reservation, {
      customerId: customer.id,
      photographerId: supunUser.id,
      date: new Date(spec.date),
      startTime: '09:00',
      endTime: '17:00',
      eventType: spec.eventType,
      location: loc.location,
      locationMapLink: loc.locationMapLink,
      city: loc.city,
      district: loc.district,
      customerNotes: `Demo reservation request for ${spec.eventType} shoot at ${loc.location}.`,
      status: spec.status,
      reservationToken: randomToken(),
      totalAmountInCents: pkg.priceInCents,
      advancePaymentPriceInCents: pkg.depositValue,
      clientSelectedPackageId: pkg.id,
      selectedPackages: [
        {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          priceInCents: pkg.priceInCents,
          durationHours: pkg.durationHours,
          includes: pkg.includes,
          depositType: pkg.depositType,
          depositValue: pkg.depositValue,
        },
      ],
      rejectionReason: spec.rejectionReason || undefined,
    });

    const savedRes = await manager.save(Reservation, res);

    // Track status totals
    if (spec.status === ReservationStatus.COMPLETED) {
      totalCompleted++;
      totalRevenueCents += pkg.priceInCents;
      
      // Save payment record for completed booking
      const payment = manager.create(Payment, {
        reservationId: savedRes.id,
        amountInCents: pkg.priceInCents,
        status: PaymentStatus.SUCCESS,
        transactionId: randomTxId(),
        cardBrand: 'Visa',
        cardLast4: '4242',
        createdAt: new Date(spec.date),
      });
      await manager.save(Payment, payment);
      totalPaymentsCount++;
    } else if (spec.status === ReservationStatus.CONFIRMED) {
      totalConfirmed++;
    } else if (spec.status === ReservationStatus.PROPOSED) {
      totalProposed++;
    } else if (spec.status === ReservationStatus.PENDING) {
      totalPending++;
    } else if (spec.status === ReservationStatus.REJECTED) {
      totalRejected++;
    } else if (spec.status === ReservationStatus.CANCELLED) {
      totalCancelled++;
    }
  }

  // 6b. Generate 15 Past & 15 Future Reservations for Nuwan Thushara
  let nuwanCompleted = 0;
  let nuwanConfirmed = 0;
  let nuwanProposed = 0;
  let nuwanPending = 0;
  let nuwanRejected = 0;
  let nuwanCancelled = 0;
  let nuwanRevenueCents = 0;

  // Nuwan: 15 Past Reservations (Completed, Cancelled, Rejected)
  const nuwanPastSpecs: ReservationSpec[] = [
    { date: '2024-02-10', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
    { date: '2024-04-15', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 6, eventType: 'Pre-Wedding' },
    { date: '2024-06-20', status: ReservationStatus.CANCELLED, pkgIndex: 2, locIndex: 1, eventType: 'Cultural Event' },
    { date: '2024-08-05', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2024-10-12', status: ReservationStatus.REJECTED, pkgIndex: 1, locIndex: 1, eventType: 'Pre-Wedding', rejectionReason: 'Schedule conflict' },
    { date: '2024-12-01', status: ReservationStatus.COMPLETED, pkgIndex: 3, locIndex: 6, eventType: 'Portrait' },
    { date: '2025-01-25', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
    { date: '2025-03-14', status: ReservationStatus.COMPLETED, pkgIndex: 2, locIndex: 6, eventType: 'Engagement' },
    { date: '2025-05-18', status: ReservationStatus.REJECTED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding', rejectionReason: 'Fully booked' },
    { date: '2025-07-22', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 6, eventType: 'Pre-Wedding' },
    { date: '2025-09-30', status: ReservationStatus.CANCELLED, pkgIndex: 3, locIndex: 1, eventType: 'Portrait' },
    { date: '2025-11-15', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2026-02-14', status: ReservationStatus.COMPLETED, pkgIndex: 1, locIndex: 1, eventType: 'Pre-Wedding' },
    { date: '2026-04-20', status: ReservationStatus.REJECTED, pkgIndex: 2, locIndex: 6, eventType: 'Cultural Event', rejectionReason: 'Client requested unreachable date' },
    { date: '2026-06-10', status: ReservationStatus.COMPLETED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
  ];

  // Nuwan: 15 Future Reservations (Pending, Proposed, Confirmed)
  const nuwanFutureSpecs: ReservationSpec[] = [
    { date: '2026-07-27', status: ReservationStatus.CONFIRMED, pkgIndex: 0, locIndex: 1, eventType: 'Wedding' },
    { date: '2026-07-30', status: ReservationStatus.PROPOSED, pkgIndex: 1, locIndex: 6, eventType: 'Pre-Wedding' },
    { date: '2026-08-04', status: ReservationStatus.PENDING, pkgIndex: 2, locIndex: 1, eventType: 'Cultural Event' },
    { date: '2026-08-10', status: ReservationStatus.CONFIRMED, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2026-08-16', status: ReservationStatus.PROPOSED, pkgIndex: 3, locIndex: 1, eventType: 'Portrait' },
    { date: '2026-08-22', status: ReservationStatus.PENDING, pkgIndex: 1, locIndex: 6, eventType: 'Pre-Wedding' },
    { date: '2026-08-29', status: ReservationStatus.CONFIRMED, pkgIndex: 2, locIndex: 1, eventType: 'Engagement' },
    { date: '2026-09-05', status: ReservationStatus.PROPOSED, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2026-09-11', status: ReservationStatus.PENDING, pkgIndex: 3, locIndex: 1, eventType: 'Portrait' },
    { date: '2026-09-16', status: ReservationStatus.CONFIRMED, pkgIndex: 1, locIndex: 6, eventType: 'Pre-Wedding' },
    { date: '2026-09-22', status: ReservationStatus.PROPOSED, pkgIndex: 2, locIndex: 1, eventType: 'Cultural Event' },
    { date: '2026-09-28', status: ReservationStatus.PENDING, pkgIndex: 0, locIndex: 6, eventType: 'Wedding' },
    { date: '2026-10-05', status: ReservationStatus.CONFIRMED, pkgIndex: 1, locIndex: 1, eventType: 'Pre-Wedding' },
    { date: '2026-10-12', status: ReservationStatus.PROPOSED, pkgIndex: 3, locIndex: 6, eventType: 'Portrait' },
    { date: '2026-10-20', status: ReservationStatus.PENDING, pkgIndex: 2, locIndex: 1, eventType: 'Engagement' },
  ];

  const allNuwanSpecs = [...nuwanPastSpecs, ...nuwanFutureSpecs];

  for (let i = 0; i < allNuwanSpecs.length; i++) {
    const spec = allNuwanSpecs[i];
    const customer = customers[(i + 5) % customers.length];
    const pkg = nuwanPackages[spec.pkgIndex];
    const loc = locationsList[spec.locIndex];

    const res = manager.create(Reservation, {
      customerId: customer.id,
      photographerId: nuwanUser.id,
      date: new Date(spec.date),
      startTime: '09:00',
      endTime: '17:00',
      eventType: spec.eventType,
      location: loc.location,
      locationMapLink: loc.locationMapLink,
      city: loc.city,
      district: loc.district,
      customerNotes: `Demo reservation request for Nuwan Thushara (${spec.eventType}) at ${loc.location}.`,
      status: spec.status,
      reservationToken: randomToken(),
      totalAmountInCents: pkg.priceInCents,
      advancePaymentPriceInCents: pkg.depositValue,
      clientSelectedPackageId: pkg.id,
      selectedPackages: [
        {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          priceInCents: pkg.priceInCents,
          durationHours: pkg.durationHours,
          includes: pkg.includes,
          depositType: pkg.depositType,
          depositValue: pkg.depositValue,
        },
      ],
      rejectionReason: spec.rejectionReason || undefined,
    });

    const savedRes = await manager.save(Reservation, res);

    if (spec.status === ReservationStatus.COMPLETED) {
      nuwanCompleted++;
      nuwanRevenueCents += pkg.priceInCents;
      
      const payment = manager.create(Payment, {
        reservationId: savedRes.id,
        amountInCents: pkg.priceInCents,
        status: PaymentStatus.SUCCESS,
        transactionId: randomTxId(),
        cardBrand: 'MasterCard',
        cardLast4: '8888',
        createdAt: new Date(spec.date),
      });
      await manager.save(Payment, payment);
    } else if (spec.status === ReservationStatus.CONFIRMED) {
      nuwanConfirmed++;
    } else if (spec.status === ReservationStatus.PROPOSED) {
      nuwanProposed++;
    } else if (spec.status === ReservationStatus.PENDING) {
      nuwanPending++;
    } else if (spec.status === ReservationStatus.REJECTED) {
      nuwanRejected++;
    } else if (spec.status === ReservationStatus.CANCELLED) {
      nuwanCancelled++;
    }
  }

  // 8. Create Demo Studio 1: Apex Lens Studios
  const apexStudioEmail = 'studio.apex@photoportal.com';
  const apexHash = await bcrypt.hash('Welcome@123', 10);
  const apexStudioUser = manager.create(User, {
    firstName: 'Ruwan',
    lastName: 'Senanayake',
    email: apexStudioEmail,
    passwordHash: apexHash,
    role: UserRole.STUDIO,
    studioName: 'Apex Lens Studios',
    studioSlug: 'studio-apex',
    maxPhotographers: 5,
    subscriptionPlan: 'PRO',
    isActive: true,
    phone: '+94773334455',
  });
  await manager.save(User, apexStudioUser);

  const apexProfile = manager.create(PhotographerProfile, {
    userId: apexStudioUser.id,
    bookingSlug: 'studio-apex',
    bio: "Colombo's premier multi-photographer production studio specializing in high-end fashion, luxury weddings, and commercial ad shoots.",
    baseLocation: 'Colombo 07, Western Province',
    city: 'Colombo',
    district: 'Colombo District',
    locationMapLink: 'https://www.google.com/maps?q=6.9174,79.8488',
    allowedEventTypes: ['Wedding', 'Fashion', 'Commercial', 'Event', 'Portrait'],
    isAvailableForBooking: true,
    universalDepositType: 'fixed',
    universalDepositValue: 2000000,
  });
  await manager.save(PhotographerProfile, apexProfile);

  // Apex Team Members
  const senakaHash = await bcrypt.hash('Welcome@123', 10);
  const senakaStaff = manager.create(User, {
    firstName: 'Senaka',
    lastName: 'Silva',
    email: 'apex.senaka@photoportal.com',
    username: 'senaka_apex',
    passwordHash: senakaHash,
    role: UserRole.STUDIO_PHOTOGRAPHER,
    studioId: apexStudioUser.id,
    studioName: 'Apex Lens Studios',
    studioSlug: 'studio-apex',
    isActive: true,
    phone: '+94774445566',
  });
  await manager.save(User, senakaStaff);

  const senakaProfile = manager.create(PhotographerProfile, {
    userId: senakaStaff.id,
    bookingSlug: 'senaka-silva',
    bio: 'Lead Wedding & Fashion Photographer at Apex Lens Studios.',
  });
  await manager.save(PhotographerProfile, senakaProfile);

  // Apex Packages
  const apexPkg = manager.create(Package, {
    photographerId: apexStudioUser.id,
    name: 'Apex Signature Wedding Suite',
    description: 'Complete luxury studio coverage with 2 senior photographers, drone cinematography, and premium printed leather album.',
    priceInCents: 30000000,
    durationHours: 12,
    depositType: 'fixed',
    depositValue: 5000000,
    includes: ['2 Lead Photographers', 'Drone Shots', '40-Page Photobook', 'All Edited RAW Files'],
    isActive: true,
  });
  await manager.save(Package, apexPkg);

  // Apex Sample Reservation
  const apexRes = manager.create(Reservation, {
    customerId: customers[0].id,
    photographerId: apexStudioUser.id,
    assignedPhotographerId: senakaStaff.id,
    date: new Date('2026-08-15'),
    startTime: '08:00',
    endTime: '18:00',
    eventType: 'Wedding',
    location: locationsList[0].location,
    city: locationsList[0].city,
    district: locationsList[0].district,
    status: ReservationStatus.CONFIRMED,
    reservationToken: randomToken(),
    totalAmountInCents: 30000000,
    advancePaymentPriceInCents: 5000000,
    clientSelectedPackageId: apexPkg.id,
  });
  await manager.save(Reservation, apexRes);

  // 9. Create Demo Studio 2: Lumina Creative Studio
  const luminaStudioEmail = 'studio.lumina@photoportal.com';
  const luminaHash = await bcrypt.hash('Welcome@123', 10);
  const luminaStudioUser = manager.create(User, {
    firstName: 'Kavinda',
    lastName: 'De Silva',
    email: luminaStudioEmail,
    passwordHash: luminaHash,
    role: UserRole.STUDIO,
    studioName: 'Lumina Creative Studio',
    studioSlug: 'studio-lumina',
    maxPhotographers: 5,
    subscriptionPlan: 'PRO',
    isActive: true,
    phone: '+94775556677',
  });
  await manager.save(User, luminaStudioUser);

  const luminaProfile = manager.create(PhotographerProfile, {
    userId: luminaStudioUser.id,
    bookingSlug: 'studio-lumina',
    bio: 'Modern creative agency & photography studio based in Galle. Specialists in beach destination weddings, event cinematography & portraiture.',
    baseLocation: 'Galle Fort, Southern Province',
    city: 'Galle',
    district: 'Galle District',
    locationMapLink: 'https://www.google.com/maps?q=6.0425,80.2032',
    allowedEventTypes: ['Wedding', 'Beach Shoot', 'Pre-Wedding', 'Event'],
    isAvailableForBooking: true,
    universalDepositType: 'fixed',
    universalDepositValue: 1500000,
  });
  await manager.save(PhotographerProfile, luminaProfile);

  // Lumina Packages
  const luminaPkg = manager.create(Package, {
    photographerId: luminaStudioUser.id,
    name: 'Galle Destination Wedding Experience',
    description: 'Bespoke coastal wedding photography & film session around Galle Fort.',
    priceInCents: 28000000,
    durationHours: 10,
    depositType: 'fixed',
    depositValue: 4000000,
    includes: ['Full Day Beach & Fort Session', 'Online Gallery', 'Highlight Reel'],
    isActive: true,
  });
  await manager.save(Package, luminaPkg);

  // Lumina Sample Reservation
  const luminaRes = manager.create(Reservation, {
    customerId: customers[1].id,
    photographerId: luminaStudioUser.id,
    date: new Date('2026-08-22'),
    startTime: '10:00',
    endTime: '18:00',
    eventType: 'Wedding',
    location: locationsList[2].location,
    city: locationsList[2].city,
    district: locationsList[2].district,
    status: ReservationStatus.PENDING,
    reservationToken: randomToken(),
    totalAmountInCents: 28000000,
    advancePaymentPriceInCents: 4000000,
    clientSelectedPackageId: luminaPkg.id,
  });
  await manager.save(Reservation, luminaRes);

  // 10. Print Comprehensive Verification Report in Console
  const totalReservations = allSpecs.length;
  const totalRevenueLkr = (totalRevenueCents / 100).toLocaleString();
  const nuwanRevenueLkr = (nuwanRevenueCents / 100).toLocaleString();

  console.log('\n========================================================================');
  console.log('🎉 DEMO SEED COMPLETED SUCCESSFULLY (WITH 2 STUDIOS & SOLO TALENT)');
  console.log('========================================================================');
  console.log(`👤 Super Admin:          ${adminEmail} / ${adminPassword}`);
  console.log('------------------------------------------------------------------------');
  console.log(`📸 Solo Photographer 1:  Supun Kanishka (${supunEmail} / ${supunPassword})`);
  console.log(`📸 Solo Photographer 2:  Nuwan Thushara (${nuwanEmail} / ${nuwanPassword})`);
  console.log('------------------------------------------------------------------------');
  console.log(`🏢 Studio 1:             Apex Lens Studios (${apexStudioEmail} / Welcome@123)`);
  console.log(`🏢 Studio 2:             Lumina Creative Studio (${luminaStudioEmail} / Welcome@123)`);
  console.log('========================================================================\n');
}

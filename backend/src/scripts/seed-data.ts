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
import { Payment, PaymentStatus } from '../entities/payment.entity';

const tok = () => crypto.randomBytes(32).toString('hex');

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

export async function seedDatabase(
  app: INestApplicationContext,
): Promise<void> {
  const dataSource = app.get(DataSource);
  const manager = dataSource.manager;

  console.log('  🗑  Clearing old tables...');
  await dataSource.query(
    'TRUNCATE TABLE messages, payments, reservations, packages, photographer_profiles, customers, users CASCADE;',
  );

  const hash = await bcrypt.hash('Photographer123!', 10);

  // ── 1. Admins ──────────────────────────────────────────────────────────────
  const superAdmin = manager.create(User, {
    firstName: 'Chathura',
    lastName: 'Mathula',
    email: 'admin@photoportal.com',
    passwordHash: await bcrypt.hash('SuperSecret123!', 10),
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    phone: '+94112345678',
  });
  await manager.save(User, superAdmin);

  const agencyAdmin = manager.create(User, {
    firstName: 'Dilhani',
    lastName: 'Jayasinghe',
    email: 'agency@photoportal.com',
    passwordHash: await bcrypt.hash('AdminSecret123!', 10),
    role: UserRole.ADMIN,
    isActive: true,
    phone: '+94118765432',
  });
  await manager.save(User, agencyAdmin);

  // ── 2. Photographers ────────────────────────────────────────────────────────
  const photographersData = [
    {
      first: 'Sarah',
      last: 'Johnson',
      email: 'sarah@photoportal.com',
      slug: 'sarah-johnson',
      loc: 'Colombo',
      bio: 'Wedding and portrait specialist.',
      specs: ['Wedding', 'Portrait'],
    },
    {
      first: 'Michael',
      last: 'Fernando',
      email: 'michael@photoportal.com',
      slug: 'michael-fernando',
      loc: 'Kandy',
      bio: 'Corporate and events expert.',
      specs: ['Corporate Event', 'Conference'],
    },
    {
      first: 'Kanishka',
      last: 'Wijewardene',
      email: 'kanishka@photoportal.com',
      slug: 'kanishka-wije',
      loc: 'Galle',
      bio: 'Destination wedding and travel storytelling.',
      specs: ['Wedding', 'Travel'],
    },
    {
      first: 'Nadeeka',
      last: 'Gunasekara',
      email: 'nadeeka@photoportal.com',
      slug: 'nadeeka-guns',
      loc: 'Colombo',
      bio: 'Newborn and maternity photographer.',
      specs: ['Family', 'Newborn', 'Maternity'],
    },
    {
      first: 'Roshan',
      last: 'Alwis',
      email: 'roshan@photoportal.com',
      slug: 'roshan-alwis',
      loc: 'Negombo',
      bio: 'Fashion, commercial, and editorial photographer.',
      specs: ['Fashion', 'Product'],
    },
    {
      first: 'Ruwan',
      last: 'Ratnayake',
      email: 'ruwan@photoportal.com',
      slug: 'ruwan-ratnayake',
      loc: 'Jaffna',
      bio: 'Traditional ceremonies and events specialist.',
      specs: ['Wedding', 'Traditional'],
    },
  ];

  const photographers: User[] = [];
  for (const p of photographersData) {
    const user = manager.create(User, {
      firstName: p.first,
      lastName: p.last,
      email: p.email,
      passwordHash: hash,
      role: UserRole.PHOTOGRAPHER,
      isActive: true,
      phone: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
    });
    await manager.save(User, user);
    photographers.push(user);

    const profile = manager.create(PhotographerProfile, {
      userId: user.id,
      bookingSlug: p.slug,
      bio: p.bio,
      specializations: p.specs,
      portfolioUrl: `https://${p.slug}photo.lk`,
      baseLocation: p.loc,
      isAvailableForBooking: true,
    });
    await manager.save(PhotographerProfile, profile);
  }

  // ── 3. Packages ────────────────────────────────────────────────────────────
  const packagesList = [
    // Sarah's packages
    {
      photographerId: photographers[0].id,
      name: 'Basic Portrait Session',
      desc: '1 hour outdoor session.',
      price: 1500000,
      duration: 1,
      includes: ['1 Hour', '10 Photos'],
    },
    {
      photographerId: photographers[0].id,
      name: 'Gold Wedding Day',
      desc: 'Full wedding day coverage.',
      price: 18500000,
      duration: 8,
      includes: ['8 Hours', '2 Photographers', 'Album'],
    },
    {
      photographerId: photographers[0].id,
      name: 'Premium Engagement',
      desc: 'Beautiful pre-wedding couple shoot.',
      price: 4500000,
      duration: 3,
      includes: ['3 Hours', '25 Photos'],
    },
    // Michael's packages
    {
      photographerId: photographers[1].id,
      name: 'Half-Day Conference',
      desc: '4 hours event coverage.',
      price: 5000000,
      duration: 4,
      includes: ['4 Hours', 'All Raw Photos'],
    },
    {
      photographerId: photographers[1].id,
      name: 'Full-Day Corporate Launch',
      desc: 'Full corporate launch event.',
      price: 9500000,
      duration: 8,
      includes: ['8 Hours', 'Edited Highlights'],
    },
    // Kanishka's packages
    {
      photographerId: photographers[2].id,
      name: 'Artistic Pre-Wedding Galle',
      desc: 'Scenic shoot at Galle Fort.',
      price: 6500000,
      duration: 4,
      includes: ['4 Hours', 'Travel Included'],
    },
    {
      photographerId: photographers[2].id,
      name: 'Elite Destination Wedding',
      desc: 'Galle coastline destination wedding.',
      price: 28000000,
      duration: 12,
      includes: ['12 Hours', 'Drone Video', 'Luxury Album'],
    },
    // Nadeeka's packages
    {
      photographerId: photographers[3].id,
      name: 'Newborn Warm Welcome',
      desc: 'Baby portrait session at home.',
      price: 2500000,
      duration: 2,
      includes: ['2 Hours', 'Props Included'],
    },
    {
      photographerId: photographers[3].id,
      name: 'Maternity Glow Session',
      desc: 'Outdoor maternity shoot.',
      price: 3000000,
      duration: 2,
      includes: ['2 Hours', 'Online Gallery'],
    },
    // Roshan's packages
    {
      photographerId: photographers[4].id,
      name: 'Editorial Fashion Shoot',
      desc: 'High fashion style modeling shoot.',
      price: 8000000,
      duration: 4,
      includes: ['4 Hours', 'Studio Rent included'],
    },
  ];

  const packages: Package[] = [];
  for (const pkg of packagesList) {
    const dbPkg = manager.create(Package, {
      photographerId: pkg.photographerId,
      name: pkg.name,
      description: pkg.desc,
      priceInCents: pkg.price,
      durationHours: pkg.duration,
      includes: pkg.includes,
      isActive: true,
      depositType: 'percentage',
      depositValue: 20, // 20% default deposit
    });
    await manager.save(Package, dbPkg);
    packages.push(dbPkg);
  }

  // ── 4. Customers ────────────────────────────────────────────────────────────
  const customersData = [
    {
      first: 'Priya',
      last: 'Perera',
      email: 'priya@example.com',
      phone: '+94771110001',
      addr: '12 Galle Road, Colombo 03',
    },
    {
      first: 'Kasun',
      last: 'Jayasinghe',
      email: 'kasun@example.com',
      phone: '+94772220002',
      addr: '45 Peradeniya Road, Kandy',
    },
    {
      first: 'Tharindu',
      last: 'Goonetilleke',
      email: 'tharindu@example.com',
      phone: '+94773330003',
      addr: '78 Wackwella Road, Galle',
    },
    {
      first: 'Roshan',
      last: 'Alwis',
      email: 'roshan@example.com',
      phone: '+94774440004',
      addr: '10 Marine Drive, Colombo 04',
    },
    {
      first: 'Amali',
      last: 'Silva',
      email: 'amali@example.com',
      phone: '+94775550005',
      addr: '23 Kandy Road, Kurunegala',
    },
    {
      first: 'Suresh',
      last: 'Ranasinghe',
      email: 'suresh@example.com',
      phone: '+94776660006',
      addr: '89 Main Street, Negombo',
    },
    {
      first: 'Nadeesha',
      last: 'Cooray',
      email: 'nadeesha@example.com',
      phone: '+94777770007',
      addr: '4 Court Road, Galle',
    },
    {
      first: 'Isuru',
      last: 'Liyanage',
      email: 'isuru@example.com',
      phone: '+94778880008',
      addr: '56 Temple Road, Anuradhapura',
    },
    {
      first: 'Sanduni',
      last: 'Wickramasinghe',
      email: 'sanduni@example.com',
      phone: '+94779990009',
      addr: '14 Hill Street, Nuwara Eliya',
    },
    {
      first: 'Thilina',
      last: 'Jayawardena',
      email: 'thilina@example.com',
      phone: '+94771230010',
      addr: '34 Jaffna Road, Vavuniya',
    },
  ];

  const customers: Customer[] = [];
  for (const c of customersData) {
    const dbCustomer = manager.create(Customer, {
      firstName: c.first,
      lastName: c.last,
      email: c.email,
      phone: c.phone,
      address: c.addr,
    });
    await manager.save(Customer, dbCustomer);
    customers.push(dbCustomer);
  }

  // ── 5. Reservations (Historical and Future) ─────────────────────────────────
  const reservationSpecs = [
    // Priya Perera - Sarah - Completed
    {
      custIdx: 0,
      photoIdx: 0,
      pkgIdx: 0,
      dateOffset: -45,
      time: ['09:00', '10:00'],
      type: 'Portrait',
      loc: 'Viharamahadevi Park, Colombo',
      dist: 'Colombo',
      city: 'Colombo',
      maps: 'https://maps.google.com/?q=6.9125,79.8612',
      status: ReservationStatus.COMPLETED,
      price: 1500000,
    },
    // Priya Perera - Sarah - Confirmed
    {
      custIdx: 0,
      photoIdx: 0,
      pkgIdx: 1,
      dateOffset: 30,
      time: ['16:00', '22:00'],
      type: 'Wedding',
      loc: 'Cinnamon Grand, Colombo',
      dist: 'Colombo',
      city: 'Colombo',
      maps: 'https://maps.google.com/?q=6.9182,79.8491',
      status: ReservationStatus.CONFIRMED,
      price: 18500000,
      adv: 3700000,
    },

    // Kasun Jayasinghe - Michael - Confirmed
    {
      custIdx: 1,
      photoIdx: 1,
      pkgIdx: 3,
      dateOffset: 10,
      time: ['09:00', '13:00'],
      type: 'Corporate Event',
      loc: 'Earls Regency, Kandy',
      dist: 'Kandy',
      city: 'Kandy',
      maps: 'https://maps.google.com/?q=7.2912,80.6521',
      status: ReservationStatus.CONFIRMED,
      price: 5000000,
      adv: 1000000,
    },
    // Kasun Jayasinghe - Michael - Pending
    {
      custIdx: 1,
      photoIdx: 1,
      pkgIdx: 4,
      dateOffset: 45,
      time: ['08:00', '16:00'],
      type: 'Conference',
      loc: 'Amaya Hills, Kandy',
      dist: 'Kandy',
      city: 'Kandy',
      maps: 'https://maps.google.com/?q=7.2625,80.6212',
      status: ReservationStatus.PENDING,
      price: 9500000,
    },

    // Tharindu - Kanishka - Confirmed
    {
      custIdx: 2,
      photoIdx: 2,
      pkgIdx: 5,
      dateOffset: 25,
      time: ['14:00', '18:00'],
      type: 'Pre-Wedding',
      loc: 'Galle Fort, Galle',
      dist: 'Galle',
      city: 'Galle',
      maps: 'https://maps.google.com/?q=6.0267,80.2014',
      status: ReservationStatus.CONFIRMED,
      price: 6500000,
      adv: 1300000,
    },
    // Tharindu - Kanishka - Proposed
    {
      custIdx: 2,
      photoIdx: 2,
      pkgIdx: 6,
      dateOffset: 60,
      time: ['10:00', '22:00'],
      type: 'Wedding',
      loc: 'Jetwing Lighthouse, Galle',
      dist: 'Galle',
      city: 'Galle',
      maps: 'https://maps.google.com/?q=6.0425,80.1812',
      status: ReservationStatus.PROPOSED,
      price: 28000000,
      deadlineOffset: 1,
    },

    // Amali Silva - Nadeeka - Completed
    {
      custIdx: 4,
      photoIdx: 3,
      pkgIdx: 7,
      dateOffset: -15,
      time: ['10:00', '12:00'],
      type: 'Newborn',
      loc: 'Home Session, Kurunegala',
      dist: 'Kurunegala',
      city: 'Kurunegala',
      maps: '',
      status: ReservationStatus.COMPLETED,
      price: 2500000,
    },
    // Amali Silva - Nadeeka - Pending
    {
      custIdx: 4,
      photoIdx: 3,
      pkgIdx: 8,
      dateOffset: 20,
      time: ['16:00', '18:00'],
      type: 'Maternity',
      loc: 'Lake Round, Kurunegala',
      dist: 'Kurunegala',
      city: 'Kurunegala',
      maps: 'https://maps.google.com/?q=7.4833,80.3667',
      status: ReservationStatus.PENDING,
      price: 3000000,
    },

    // Roshan Alwis - Roshan - Proposed (Overdue payment deadline edge case)
    {
      custIdx: 3,
      photoIdx: 4,
      pkgIdx: 9,
      dateOffset: 5,
      time: ['09:00', '13:00'],
      type: 'Fashion',
      loc: 'Studio, Colombo',
      dist: 'Colombo',
      city: 'Colombo',
      maps: '',
      status: ReservationStatus.PROPOSED,
      price: 8000000,
      deadlineOffset: -2,
    },

    // Suresh - Sarah - Cancelled
    {
      custIdx: 5,
      photoIdx: 0,
      pkgIdx: 2,
      dateOffset: -5,
      time: ['15:00', '18:00'],
      type: 'Engagement',
      loc: 'Beach Park, Negombo',
      dist: 'Gampaha',
      city: 'Negombo',
      maps: 'https://maps.google.com/?q=7.2111,79.8388',
      status: ReservationStatus.CANCELLED,
      price: 4500000,
    },
    // Nadeesha - Kanishka - Rejected
    {
      custIdx: 6,
      photoIdx: 2,
      pkgIdx: 5,
      dateOffset: -12,
      time: ['08:00', '12:00'],
      type: 'Pre-Wedding',
      loc: 'Lighthouse beach, Galle',
      dist: 'Galle',
      city: 'Galle',
      maps: '',
      status: ReservationStatus.REJECTED,
      price: 6500000,
    },
  ];

  for (const spec of reservationSpecs) {
    const resToken = tok();
    const reservation = manager.create(Reservation, {
      customerId: customers[spec.custIdx].id,
      photographerId: photographers[spec.photoIdx].id,
      date: daysFromNow(spec.dateOffset),
      startTime: spec.time[0],
      endTime: spec.time[1],
      eventType: spec.type,
      location: spec.loc,
      district: spec.dist,
      city: spec.city,
      locationMapLink: spec.maps || undefined,
      status: spec.status,
      reservationToken: resToken,
      totalAmountInCents: spec.price,
      advancePaymentPriceInCents: spec.adv || undefined,
      paymentDeadline:
        spec.deadlineOffset !== undefined
          ? daysFromNow(spec.deadlineOffset)
          : undefined,
      clientSelectedPackageId: packages[spec.pkgIdx].id,
      selectedPackages: [packages[spec.pkgIdx]],
    });
    await manager.save(Reservation, reservation);

    // If confirmed/completed, log successful payment records
    if (spec.status === ReservationStatus.CONFIRMED && spec.adv) {
      const payment = manager.create(Payment, {
        reservationId: reservation.id,
        amountInCents: spec.adv,
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: 'Visa',
        cardLast4: '4242',
      });
      await manager.save(Payment, payment);
    } else if (spec.status === ReservationStatus.COMPLETED) {
      // 1st payment: advance
      const advancePay = manager.create(Payment, {
        reservationId: reservation.id,
        amountInCents: Math.round(spec.price * 0.2),
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: 'Mastercard',
        cardLast4: '8888',
      });
      await manager.save(Payment, advancePay);
      // 2nd payment: remaining balance
      const balancePay = manager.create(Payment, {
        reservationId: reservation.id,
        amountInCents: Math.round(spec.price * 0.8),
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: 'Offline Payment',
        cardLast4: 'Cash',
      });
      await manager.save(Payment, balancePay);
    }
  }

  // ── 6. Chat Messages ────────────────────────────────────────────────────────
  const chatMessages = [
    {
      resIdx: 2,
      sender: 'CUSTOMER',
      senderName: 'Kasun Jayasinghe',
      text: 'Hi Michael, is Kandy base location charge included in the event pricing?',
    },
    {
      resIdx: 2,
      sender: 'PHOTOGRAPHER',
      senderName: 'Michael Fernando',
      text: 'Yes, Peradeniya and Kandy limits are completely covered with no extra mileage fee!',
    },
  ];

  for (const msg of chatMessages) {
    // Find Kandy reservation
    const res = await manager.findOneBy(Reservation, {
      eventType: 'Corporate Event',
    });
    if (res) {
      const dbMsg = manager.create(Message, {
        reservationId: res.id,
        sender: msg.sender as any,
        senderName: msg.senderName,
        content: msg.text,
      });
      await manager.save(Message, dbMsg);
    }
  }

  console.log(
    '🌱 Database seeding completed with Sri Lankan names, locations and statuses!',
  );
}

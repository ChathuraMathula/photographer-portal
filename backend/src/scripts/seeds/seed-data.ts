import { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../../entities/user.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { Customer } from '../../entities/customer.entity';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { Package } from '../../entities/package.entity';
import { Message } from '../../entities/message.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

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
      isRead: true,
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
        isRead: true,
      });
      await manager.save(Message, dbMsg);
    }
  }

  // ── 7. Bulk Sri Lankan Seed Data (Thousands) ───────────────────────────────
  console.log(
    '  Generating bulk Sri Lankan photographers, customers, and reservations...',
  );

  const lkFirstNames = [
    'Pathum',
    'Chathura',
    'Dilshan',
    'Kanishka',
    'Nadeeka',
    'Roshan',
    'Ruwan',
    'Priya',
    'Kasun',
    'Tharindu',
    'Amali',
    'Suresh',
    'Nadeesha',
    'Isuru',
    'Sanduni',
    'Thilina',
    'Lahiru',
    'Anushka',
    'Sajith',
    'Kavinda',
    'Chamara',
    'Dhanushka',
    'Dinuka',
    'Nipuna',
    'Oshada',
    'Geeth',
    'Harsha',
    'Milan',
    'Nuwan',
    'Ranil',
    'Sachith',
    'Upul',
    'Yohan',
    'Asanka',
    'Mahesh',
    'Duminda',
    'Kelum',
    'Pramod',
    'Gayan',
    'Buddhika',
    'Sameera',
    'Indika',
    'Pradeep',
    'Sanjeewa',
    'Nalin',
    'Dinesh',
    'Manoj',
    'Priyanthi',
    'Nilanthi',
    'Samanthi',
    'Tharushi',
    'Kavindi',
    'Chamari',
    'Dilini',
    'Hashini',
    'Menaka',
    'Sajini',
    'Hansini',
    'Malkanthi',
    'Oshadi',
    'Gayani',
    'Madu',
    'Sachini',
    'Yoshini',
    'Nilmini',
    'Erandi',
    'Bhagya',
    'Dilrukshi',
    'Ishara',
    'Sandamali',
    'Piyumi',
    'Shashika',
    'Upeksha',
    'Dilani',
    'Ruwani',
    'Chathurika',
  ];

  const lkLastNames = [
    'Perera',
    'Jayasinghe',
    'Goonetilleke',
    'Alwis',
    'Silva',
    'Ranasinghe',
    'Cooray',
    'Liyanage',
    'Wickramasinghe',
    'Jayawardena',
    'Fernando',
    'Ratnayake',
    'Wijewardene',
    'Gunasekara',
    'Senanayake',
    'Rajapaksa',
    'Herath',
    'Bandara',
    'Karunaratne',
    'Dissanayake',
    'Edirisinghe',
    'Peiris',
    'Rodrigo',
    'Mendis',
    'Fonseka',
    'Samaranayake',
    'Abeyasinghe',
    'Weerasinghe',
    'Attanayake',
    'Gunawardena',
    'Premadasa',
    'Kumarasinghe',
    'Pathirana',
    'Siriwardena',
    'Hettiarachchi',
    'Munasinghe',
    'Tennakoon',
    'Kariyawasam',
  ];

  const lkLocations = [
    {
      district: 'Colombo',
      city: 'Colombo',
      loc: 'Viharamahadevi Park, Colombo',
    },
    { district: 'Colombo', city: 'Dehiwala', loc: 'Dehiwala Beach, Dehiwala' },
    {
      district: 'Colombo',
      city: 'Mount Lavinia',
      loc: 'Mount Lavinia Hotel, Mount Lavinia',
    },
    { district: 'Colombo', city: 'Moratuwa', loc: 'Bolgoda Lake, Moratuwa' },
    { district: 'Colombo', city: 'Kotte', loc: 'Diyatha Uyana, Battaramulla' },
    { district: 'Kandy', city: 'Kandy', loc: 'Kandy Lake Round, Kandy' },
    {
      district: 'Kandy',
      city: 'Peradeniya',
      loc: 'Royal Botanical Gardens, Peradeniya',
    },
    { district: 'Galle', city: 'Galle', loc: 'Galle Fort, Galle' },
    { district: 'Galle', city: 'Unawatuna', loc: 'Jungle Beach, Unawatuna' },
    {
      district: 'Gampaha',
      city: 'Gampaha',
      loc: 'Henarathgoda Botanical Garden, Gampaha',
    },
    { district: 'Gampaha', city: 'Negombo', loc: 'Negombo Beach, Negombo' },
    {
      district: 'Kurunegala',
      city: 'Kurunegala',
      loc: 'Ethagala Rock, Kurunegala',
    },
    {
      district: 'Jaffna',
      city: 'Jaffna',
      loc: 'Nallur Kandaswamy Temple, Jaffna',
    },
    { district: 'Matara', city: 'Mirissa', loc: 'Coconut Tree Hill, Mirissa' },
    {
      district: 'Nuwara Eliya',
      city: 'Nuwara Eliya',
      loc: 'Gregory Lake, Nuwara Eliya',
    },
    { district: 'Kalutara', city: 'Panadura', loc: 'Panadura Beach, Panadura' },
    { district: 'Badulla', city: 'Ella', loc: 'Nine Arch Bridge, Ella' },
    {
      district: 'Trincomalee',
      city: 'Trincomalee',
      loc: 'Nilaveli Beach, Trincomalee',
    },
  ];

  const specsList = [
    'Wedding',
    'Portrait',
    'Corporate Event',
    'Conference',
    'Family',
    'Newborn',
    'Maternity',
    'Fashion',
    'Product',
    'Travel',
  ];

  const lkBios = [
    'Capturing raw emotions and beautiful moments across Sri Lanka.',
    'Professional visual storyteller specializing in weddings and lifestyle portraits.',
    'Event and commercial photographer with over 5 years of industry experience.',
    'Dedicated to framing your memories in the most aesthetic way possible.',
    'Bringing a unique creative vision to product, fashion, and portrait sessions.',
  ];

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const pickMultiple = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const numPhotographers = 10000;
  const numCustomers = 10000;
  const numReservations = 100000;

  // 1. Generate Photographers
  const bulkPhotographers: User[] = [];
  const bulkProfiles: PhotographerProfile[] = [];
  const bulkPackages: Package[] = [];

  console.log(`  Generating ${numPhotographers} photographers & profiles...`);
  for (let i = 0; i < numPhotographers; i++) {
    const first = pick(lkFirstNames);
    const last = pick(lkLastNames);
    const email = `photographer_${i}_${Date.now()}@photoportal.com`;
    const userId = crypto.randomUUID();

    const user = manager.create(User, {
      id: userId,
      firstName: first,
      lastName: last,
      email: email,
      passwordHash: hash,
      role: UserRole.PHOTOGRAPHER,
      isActive: true,
      phone: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
    });
    bulkPhotographers.push(user);

    const location = pick(lkLocations);
    const slug = `${first.toLowerCase()}-${last.toLowerCase()}-${i}-${Math.floor(Math.random() * 10000)}`;

    const profile = manager.create(PhotographerProfile, {
      id: crypto.randomUUID(),
      userId: userId,
      bookingSlug: slug,
      bio: pick(lkBios),
      specializations: pickMultiple(specsList, 2),
      portfolioUrl: `https://${slug}photo.lk`,
      baseLocation: location.city,
      isAvailableForBooking: true,
    });
    bulkProfiles.push(profile);

    // Create 2 packages per photographer
    const pkg1 = manager.create(Package, {
      id: crypto.randomUUID(),
      photographerId: userId,
      name: 'Standard Session',
      description: 'Standard session covering key highlights.',
      priceInCents: 2000000 + Math.floor(Math.random() * 10000000),
      durationHours: 2,
      includes: ['2 Hours', 'Digital Gallery'],
      isActive: true,
      depositType: 'percentage',
      depositValue: 20,
    });

    const pkg2 = manager.create(Package, {
      id: crypto.randomUUID(),
      photographerId: userId,
      name: 'Elite Package',
      description: 'Comprehensive coverage with premium albums and drones.',
      priceInCents: 12000000 + Math.floor(Math.random() * 20000000),
      durationHours: 6,
      includes: ['6 Hours', 'Premium Album', 'All Digital Copy'],
      isActive: true,
      depositType: 'percentage',
      depositValue: 25,
    });

    bulkPackages.push(pkg1, pkg2);
  }

  // Save users, profiles & packages in chunks using insert (much faster than save)
  const insertChunkSize = 1000;
  console.log('  Inserting photographers into database...');
  for (let i = 0; i < bulkPhotographers.length; i += insertChunkSize) {
    await manager.insert(User, bulkPhotographers.slice(i, i + insertChunkSize));
  }
  console.log('  Inserting photographer profiles into database...');
  for (let i = 0; i < bulkProfiles.length; i += insertChunkSize) {
    await manager.insert(
      PhotographerProfile,
      bulkProfiles.slice(i, i + insertChunkSize),
    );
  }
  console.log('  Inserting packages into database...');
  for (let i = 0; i < bulkPackages.length; i += insertChunkSize) {
    await manager.insert(Package, bulkPackages.slice(i, i + insertChunkSize));
  }

  // 2. Generate Customers
  console.log(`  Generating ${numCustomers} customers...`);
  const bulkCustomers: Customer[] = [];
  for (let i = 0; i < numCustomers; i++) {
    const first = pick(lkFirstNames);
    const last = pick(lkLastNames);
    const location = pick(lkLocations);
    const email = `customer_${i}_${Date.now()}@example.com`;

    const customer = manager.create(Customer, {
      id: crypto.randomUUID(),
      firstName: first,
      lastName: last,
      email: email,
      phone: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
      address: `${Math.floor(1 + Math.random() * 150)} Main Street, ${location.city}`,
    });
    bulkCustomers.push(customer);
  }

  console.log('  Inserting customers into database...');
  for (let i = 0; i < bulkCustomers.length; i += insertChunkSize) {
    await manager.insert(Customer, bulkCustomers.slice(i, i + insertChunkSize));
  }

  // Map packages to their photographers for quick lookups
  const photographerPackagesMap = new Map<string, Package[]>();
  for (const pkg of bulkPackages) {
    if (!photographerPackagesMap.has(pkg.photographerId)) {
      photographerPackagesMap.set(pkg.photographerId, []);
    }
    photographerPackagesMap.get(pkg.photographerId)!.push(pkg);
  }

  // 3. Generate Reservations
  const statuses = [
    ReservationStatus.PENDING,
    ReservationStatus.PROPOSED,
    ReservationStatus.REJECTED,
    ReservationStatus.CONFIRMED,
    ReservationStatus.CANCELLED,
    ReservationStatus.COMPLETED,
  ];

  const eventTypes = [
    'Wedding',
    'Portrait',
    'Corporate Event',
    'Conference',
    'Maternity',
    'Newborn',
  ];

  console.log(`  Generating ${numReservations} reservations...`);
  const bulkReservations: Reservation[] = [];
  const bulkPayments: Payment[] = [];

  for (let i = 0; i < numReservations; i++) {
    const customer = pick(bulkCustomers);
    const photographer = pick(bulkPhotographers);
    const packagesForPhoto = photographerPackagesMap.get(photographer.id) || [];
    if (packagesForPhoto.length === 0) continue;

    const pkg = pick(packagesForPhoto);
    const location = pick(lkLocations);
    const status = pick(statuses);
    const dateOffset = Math.floor(Math.random() * 150) - 60; // -60 to +90 days
    const totalAmount = pkg.priceInCents;
    const advanceAmount = Math.round(totalAmount * (pkg.depositValue / 100));
    const reservationId = crypto.randomUUID();

    const reservation = manager.create(Reservation, {
      id: reservationId,
      customerId: customer.id,
      photographerId: photographer.id,
      date: daysFromNow(dateOffset),
      startTime: '09:00',
      endTime: '12:00',
      eventType: pick(eventTypes),
      location: location.loc,
      district: location.district,
      city: location.city,
      status: status,
      reservationToken: crypto.randomUUID(),
      totalAmountInCents: totalAmount,
      advancePaymentPriceInCents: advanceAmount,
      paymentDeadline:
        status === ReservationStatus.PROPOSED ? daysFromNow(2) : undefined,
      clientSelectedPackageId: pkg.id,
      selectedPackages: [pkg],
    });

    bulkReservations.push(reservation);

    // Generate payments for confirmed/completed statuses
    if (status === ReservationStatus.CONFIRMED) {
      const pay = manager.create(Payment, {
        id: crypto.randomUUID(),
        reservationId: reservationId,
        amountInCents: advanceAmount,
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_bulk_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: pick(['Visa', 'Mastercard']),
        cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      });
      bulkPayments.push(pay);
    } else if (status === ReservationStatus.COMPLETED) {
      const pay1 = manager.create(Payment, {
        id: crypto.randomUUID(),
        reservationId: reservationId,
        amountInCents: advanceAmount,
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_bulk_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: pick(['Visa', 'Mastercard']),
        cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      });
      const pay2 = manager.create(Payment, {
        id: crypto.randomUUID(),
        reservationId: reservationId,
        amountInCents: totalAmount - advanceAmount,
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_bulk_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: 'Offline Payment',
        cardLast4: 'Cash',
      });
      bulkPayments.push(pay1, pay2);
    }
  }

  console.log('  Inserting reservations into database...');
  const resChunkSize = 2000;
  for (let i = 0; i < bulkReservations.length; i += resChunkSize) {
    await manager.insert(
      Reservation,
      bulkReservations.slice(i, i + resChunkSize),
    );
  }

  console.log('  Inserting payments into database...');
  for (let i = 0; i < bulkPayments.length; i += resChunkSize) {
    await manager.insert(Payment, bulkPayments.slice(i, i + resChunkSize));
  }

  console.log(
    `🌱 Database seeding completed with ${numPhotographers} Sri Lankan photographers and ${numReservations} reservations!`,
  );
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { PhotographersModule } from './photographers/photographers.module';
import { PackagesModule } from './packages/packages.module';
import { EmailModule } from './email/email.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './entities/user.entity';
import { PhotographerProfile } from './entities/photographer-profile.entity';
import { Package } from './entities/package.entity';
import { Customer } from './entities/customer.entity';
import { Reservation } from './entities/reservation.entity';
import { Message } from './entities/message.entity';
import { Payment } from './entities/payment.entity';

// Load local .env variables
const envPath = join(process.cwd(), '.env');
if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === 'function') {
  (process as any).loadEnvFile(envPath);
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
      username: process.env.DB_USERNAME ?? 'admin',
      password: process.env.DB_PASSWORD ?? 'securepassword123',
      database: process.env.DB_DATABASE ?? 'portal',
      entities: [
        User,
        PhotographerProfile,
        Package,
        Customer,
        Reservation,
        Message,
        Payment,
      ],
      synchronize: true, // Automatically synchronize schema in development
    }),
    DatabaseModule,
    EmailModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    ReservationsModule,
    PaymentsModule,
    PhotographersModule,
    PackagesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

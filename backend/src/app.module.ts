import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PhotographersModule } from './photographers/photographers.module';
import { PackagesModule } from './packages/packages.module';
import { EmailModule } from './email/email.module';
import { User } from './entities/user.entity';
import { PhotographerProfile } from './entities/photographer-profile.entity';
import { Package } from './entities/package.entity';
import { Customer } from './entities/customer.entity';
import { Reservation } from './entities/reservation.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'admin',
      password: 'securepassword123',
      database: 'portal',
      entities: [
        User,
        PhotographerProfile,
        Package,
        Customer,
        Reservation,
        Message,
      ],
      synchronize: true, // Automatically synchronize schema in development
    }),
    DatabaseModule,
    EmailModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    ReservationsModule,
    PhotographersModule,
    PackagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

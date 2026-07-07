import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsValidationService } from './bookings-validation.service';
import { BookingsLifecycleService } from './bookings-lifecycle.service';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [DatabaseModule, ReservationsModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsValidationService,
    BookingsLifecycleService,
  ],
})
export class BookingsModule {}

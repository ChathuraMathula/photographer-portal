import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsValidationService } from './services/bookings-validation.service';
import { BookingsLifecycleService } from './services/bookings-lifecycle.service';
import { BookingsQueryService } from './services/bookings-query.service';
import { BookingsChatService } from './services/bookings-chat.service';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [DatabaseModule, ReservationsModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsValidationService,
    BookingsLifecycleService,
    BookingsQueryService,
    BookingsChatService,
  ],
  exports: [
    BookingsService,
    BookingsValidationService,
    BookingsLifecycleService,
    BookingsQueryService,
    BookingsChatService,
  ],
})
export class BookingsModule {}

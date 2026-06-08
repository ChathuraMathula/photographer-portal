import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// No auth guards — this is the public-facing booking API
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(':slug')
  getPhotographerProfile(@Param('slug') slug: string) {
    return this.bookingsService.getPhotographerProfile(slug);
  }

  @Get(':slug/availability')
  checkAvailability(
    @Param('slug') slug: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.bookingsService.checkAvailability(
      slug,
      date,
      startTime,
      endTime,
    );
  }

  @Post(':slug')
  createBooking(@Param('slug') slug: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(slug, dto);
  }

  @Get('track/:token')
  trackReservation(@Param('token') token: string) {
    return this.bookingsService.trackReservation(token);
  }
}

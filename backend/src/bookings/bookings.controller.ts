import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('resolve-map-link')
  async resolveMapLink(@Query('url') url: string) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      return { expandedUrl: response.url };
    } catch (err) {
      return { expandedUrl: url };
    }
  }

  @Get('customer-by-email')
  findCustomerByEmail(@Query('email') email: string) {
    return this.bookingsService.findCustomerByEmail(email);
  }

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
  trackReservation(
    @Param('token') token: string,
    @Query('email') email: string,
  ) {
    return this.bookingsService.trackReservation(token, email);
  }

  @Post('track/:token/verify')
  verifyEmail(@Param('token') token: string, @Body('email') email: string) {
    return this.bookingsService.verifyTrackingEmail(token, email);
  }

  @Get('track/:token/messages')
  getMessages(@Param('token') token: string, @Query('email') email: string) {
    return this.bookingsService.getMessages(token, email);
  }

  @Post('track/:token/messages')
  sendMessage(
    @Param('token') token: string,
    @Body('email') email: string,
    @Body('content') content: string,
  ) {
    return this.bookingsService.sendMessage(token, email, content);
  }

  @Post('track/:token/messages/read')
  markCustomerMessagesAsRead(
    @Param('token') token: string,
    @Body('email') email: string,
  ) {
    return this.bookingsService.markCustomerMessagesAsRead(token, email);
  }

  @Post('track/:token/confirm')
  confirm(
    @Param('token') token: string,
    @Body('email') email: string,
    @Body('packageId') packageId: string,
  ) {
    return this.bookingsService.confirmBooking(token, email, packageId);
  }

  @Post('track/:token/cancel')
  cancel(@Param('token') token: string, @Body('email') email: string) {
    return this.bookingsService.cancelBooking(token, email);
  }
}

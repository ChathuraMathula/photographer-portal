import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsValidationService } from './services/bookings-validation.service';
import { BookingsLifecycleService } from './services/bookings-lifecycle.service';
import { BookingsQueryService } from './services/bookings-query.service';
import { BookingsChatService } from './services/bookings-chat.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly validationService: BookingsValidationService,
    private readonly lifecycleService: BookingsLifecycleService,
    private readonly queryService: BookingsQueryService,
    private readonly chatService: BookingsChatService,
  ) {}

  async getPhotographerProfile(slug: string) {
    return this.queryService.getPhotographerProfile(slug);
  }

  async findCustomerByEmail(email: string) {
    return this.validationService.findCustomerByEmail(email);
  }

  async checkAvailability(
    slug: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const result = await this.validationService.checkAvailability(
      slug,
      date,
      startTime,
      endTime,
    );
    return { available: result.available, reason: result.reason };
  }

  async createBooking(slug: string, dto: CreateBookingDto) {
    return this.lifecycleService.createBooking(slug, dto);
  }

  async trackReservation(token: string, email: string) {
    return this.queryService.trackReservation(token, email);
  }

  async verifyTrackingEmail(token: string, email: string) {
    return this.queryService.verifyTrackingEmail(token, email);
  }

  async getMessages(token: string, email: string) {
    return this.chatService.getMessages(token, email);
  }

  async sendMessage(token: string, email: string, content: string) {
    return this.chatService.sendMessage(token, email, content);
  }

  async confirmBooking(token: string, email: string, packageId: string) {
    return this.lifecycleService.confirmBooking(token, email, packageId);
  }

  async cancelBooking(token: string, email: string) {
    return this.lifecycleService.cancelBooking(token, email);
  }
}

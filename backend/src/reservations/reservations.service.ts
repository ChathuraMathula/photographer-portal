import { Injectable } from '@nestjs/common';
import { ReservationStatus } from '../entities/reservation.entity';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ProposeQuotationDto } from './dto/propose-quotation.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ReservationsQuotationService } from './services/reservations-quotation.service';
import { ReservationsLifecycleService } from './services/reservations-lifecycle.service';
import { ReservationsQueryService } from './services/reservations-query.service';
import { ReservationsChatService } from './services/reservations-chat.service';
import { ReservationsNotificationService } from './services/reservations-notification.service';
import { JwtUser } from './interfaces/jwt-user.interface';

export type { JwtUser };

@Injectable()
export class ReservationsService {
  constructor(
    private readonly queryService: ReservationsQueryService,
    private readonly chatService: ReservationsChatService,
    private readonly notificationService: ReservationsNotificationService,
    private readonly quotationService: ReservationsQuotationService,
    private readonly lifecycleService: ReservationsLifecycleService,
  ) {}

  async findAll(
    user: JwtUser,
    queryOptions: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {},
  ) {
    return this.queryService.findAll(user, queryOptions);
  }

  async findOne(id: string, user: JwtUser) {
    return this.queryService.findOne(id, user);
  }

  async updateStatus(id: string, status: ReservationStatus, user: JwtUser) {
    return this.queryService.updateStatus(id, status, user);
  }

  async createManualBooking(dto: CreateManualBookingDto, user: JwtUser) {
    return this.lifecycleService.createManualBooking(dto, user);
  }

  async proposeQuotation(id: string, dto: ProposeQuotationDto, user: JwtUser) {
    const reservation = await this.findOne(id, user);
    return this.quotationService.proposeQuotation(reservation, dto, user);
  }

  async rejectReservation(
    id: string,
    dto: RejectReservationDto,
    user: JwtUser,
  ) {
    const reservation = await this.findOne(id, user);
    return this.quotationService.rejectReservation(reservation, dto, user);
  }

  async getMessages(id: string, user: JwtUser) {
    return this.chatService.getMessages(id, user);
  }

  async sendMessage(id: string, content: string, user: JwtUser) {
    return this.chatService.sendMessage(id, content, user);
  }

  async getUnreadNotifications(user: JwtUser) {
    return this.notificationService.getUnreadNotifications(user);
  }

  async markReservationAsRead(id: string, user: JwtUser) {
    return this.notificationService.markReservationAsRead(id, user);
  }

  async markMessagesAsRead(id: string, user: JwtUser) {
    return this.notificationService.markMessagesAsRead(id, user);
  }
}

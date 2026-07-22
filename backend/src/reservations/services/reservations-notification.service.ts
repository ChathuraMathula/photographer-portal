import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Message } from '../../entities/message.entity';
import { JwtUser } from '../interfaces/jwt-user.interface';
import { ReservationsQueryService } from './reservations-query.service';

@Injectable()
export class ReservationsNotificationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly queryService: ReservationsQueryService,
  ) {}

  async getUnreadNotifications(user: JwtUser) {
    const unreadReservations = await this.reservationRepository.find({
      where: {
        photographerId: user.userId,
        isRead: false,
      },
      relations: { customer: true },
    });

    const unreadMessages = await this.messageRepository.find({
      where: {
        reservation: {
          photographerId: user.userId,
        },
        sender: 'CUSTOMER',
        isRead: false,
      },
      relations: { reservation: true },
    });

    return {
      reservations: unreadReservations,
      messages: unreadMessages,
    };
  }

  async markReservationAsRead(id: string, user: JwtUser) {
    const reservation = await this.queryService.findOne(id, user);
    reservation.isRead = true;
    return this.reservationRepository.save(reservation);
  }

  async markMessagesAsRead(id: string, user: JwtUser) {
    await this.queryService.findOne(id, user); // Verify ownership
    await this.messageRepository.update(
      { reservationId: id, sender: 'CUSTOMER', isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}

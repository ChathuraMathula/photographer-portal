import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Message } from '../../entities/message.entity';
import { ChatGateway } from '../../reservations/chat.gateway';

@Injectable()
export class BookingsChatService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getMessages(token: string, email: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    return this.messageRepository.find({
      where: { reservationId: reservation.id },
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(token: string, email: string, content: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    const message = this.messageRepository.create({
      reservationId: reservation.id,
      sender: 'CUSTOMER',
      senderName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      content,
    });
    await this.messageRepository.save(message);

    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('message', message);

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('messageReceived', { reservationId: reservation.id, message });

    return message;
  }
}

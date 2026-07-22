import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { ChatGateway } from '../chat.gateway';
import { JwtUser } from '../interfaces/jwt-user.interface';
import { ReservationsQueryService } from './reservations-query.service';

@Injectable()
export class ReservationsChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly queryService: ReservationsQueryService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getMessages(id: string, user: JwtUser) {
    await this.queryService.findOne(id, user);

    return this.messageRepository.find({
      where: { reservationId: id },
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(id: string, content: string, user: JwtUser) {
    const reservation = await this.queryService.findOne(id, user);

    const message = this.messageRepository.create({
      reservationId: id,
      sender: 'PHOTOGRAPHER',
      senderName: user.firstName || 'Photographer',
      content,
    });
    await this.messageRepository.save(message);

    this.chatGateway.server.to(`reservation_${id}`).emit('message', message);
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('messageReceived', { reservationId: id, message });

    return message;
  }
}

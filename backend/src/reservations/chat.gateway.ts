import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Reservation } from '../entities/reservation.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinReservation')
  handleJoinReservation(
    @MessageBody() data: { reservationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`👤 Client ${client.id} joining room: reservation_${data.reservationId}`);
    client.join(`reservation_${data.reservationId}`);
    return { status: 'joined' };
  }

  @SubscribeMessage('leaveReservation')
  handleLeaveReservation(
    @MessageBody() data: { reservationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`👤 Client ${client.id} leaving room: reservation_${data.reservationId}`);
    client.leave(`reservation_${data.reservationId}`);
    return { status: 'left' };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      reservationId: string;
      sender: 'PHOTOGRAPHER' | 'CUSTOMER';
      senderName: string;
      content: string;
    },
  ) {
    console.log(`💬 Message received for reservation ${data.reservationId} from ${data.senderName}`);
    
    // Save to DB
    const message = this.messageRepository.create({
      reservationId: data.reservationId,
      sender: data.sender,
      senderName: data.senderName,
      content: data.content,
    });
    await this.messageRepository.save(message);

    // Broadcast to room
    this.server
      .to(`reservation_${data.reservationId}`)
      .emit('message', message);

    const reservation = await this.reservationRepository.findOneBy({ id: data.reservationId });
    if (reservation) {
      this.server
        .to(`photographer_${reservation.photographerId}`)
        .emit('messageReceived', { reservationId: reservation.id, message });
    }
  }

  @SubscribeMessage('joinPhotographerDashboard')
  handleJoinPhotographer(
    @MessageBody() data: { photographerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`👤 Photographer ${data.photographerId} joining room: photographer_${data.photographerId}`);
    client.join(`photographer_${data.photographerId}`);
    return { status: 'joined' };
  }

  // Live slot status locking:
  @SubscribeMessage('joinBooking')
  handleJoinBooking(
    @MessageBody() data: { bookingSlug: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`👤 Client ${client.id} viewing photographer calendar: booking_${data.bookingSlug}`);
    client.join(`booking_${data.bookingSlug}`);
    return { status: 'joined' };
  }

  // Broadcaster utility for other services (e.g. BookingsService when reservation created or confirmed)
  broadcastAvailabilityChange(bookingSlug: string, date: string, startTime: string, endTime: string, available: boolean) {
    console.log(`📢 Broadcasting availability change for ${bookingSlug} on ${date}: available=${available}`);
    this.server.to(`booking_${bookingSlug}`).emit('availabilityChange', {
      date,
      startTime,
      endTime,
      available,
    });
  }
}

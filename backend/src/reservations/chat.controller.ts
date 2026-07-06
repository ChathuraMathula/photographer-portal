import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ChatWorkerGateway } from './chat-worker.gateway';

@Controller()
export class ChatController {
  constructor(private readonly chatWorker: ChatWorkerGateway) {}

  @EventPattern('chat.broadcast')
  handleBroadcast(@Payload() payload: { room: string; event: string; data: any }) {
    this.chatWorker.server.to(payload.room).emit(payload.event, payload.data);
  }

  @EventPattern('chat.availabilityChange')
  handleAvailabilityChange(
    @Payload()
    payload: {
      bookingSlug: string;
      date: string;
      startTime: string;
      endTime: string;
      available: boolean;
    },
  ) {
    this.chatWorker.server
      .to(`booking_${payload.bookingSlug}`)
      .emit('availabilityChange', {
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        available: payload.available,
      });
  }

  @EventPattern('chat.profileUpdate')
  handleProfileUpdate(
    @Payload() payload: { bookingSlug: string; profileData: any },
  ) {
    this.chatWorker.server
      .to(`booking_${payload.bookingSlug}`)
      .emit('profileUpdated', payload.profileData);
  }
}

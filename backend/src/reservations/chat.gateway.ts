import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ChatGateway {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  // Proxy object that mimics Socket.IO's Server API for emitting events
  public server = {
    to: (room: string) => ({
      emit: (event: string, data: any) => {
        this.client.emit('chat.broadcast', { room, event, data });
      },
    }),
  };

  broadcastAvailabilityChange(
    bookingSlug: string,
    date: string,
    startTime: string,
    endTime: string,
    available: boolean,
  ) {
    this.client.emit('chat.availabilityChange', {
      bookingSlug,
      date,
      startTime,
      endTime,
      available,
    });
  }

  broadcastProfileUpdate(bookingSlug: string, profileData: any) {
    this.client.emit('chat.profileUpdate', { bookingSlug, profileData });
  }
}

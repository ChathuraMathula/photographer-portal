import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ChatWorkerGateway } from './chat-worker.gateway';

@Injectable()
export class ChatGateway {
  constructor(
    @Inject(forwardRef(() => ChatWorkerGateway))
    private readonly chatWorker: ChatWorkerGateway,
  ) {}

  // Proxy object that mimics Socket.IO's Server API for emitting events
  public get server() {
    return {
      to: (room: string) => ({
        emit: (event: string, data: any) => {
          if (this.chatWorker?.server) {
            this.chatWorker.server.to(room).emit(event, data);
          }
        },
      }),
    };
  }

  broadcastAvailabilityChange(
    bookingSlug: string,
    date: string,
    startTime: string,
    endTime: string,
    available: boolean,
  ) {
    if (this.chatWorker?.server) {
      this.chatWorker.server
        .to(`booking_${bookingSlug}`)
        .emit('availabilityChange', {
          date,
          startTime,
          endTime,
          available,
        });
    }
  }

  broadcastProfileUpdate(bookingSlug: string, profileData: any) {
    if (this.chatWorker?.server) {
      this.chatWorker.server
        .to(`booking_${bookingSlug}`)
        .emit('profileUpdated', profileData);
      this.chatWorker.server.emit('photographerUpdated', profileData);
    }
  }

  broadcastPhotographerUpdate(profileData: any) {
    if (this.chatWorker?.server) {
      this.chatWorker.server.emit('photographerUpdated', profileData);
    }
  }
}

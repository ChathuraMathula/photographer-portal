import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ChatGateway } from './chat.gateway';
import { ReservationsQuotationService } from './reservations-quotation.service';
import { ReservationsLifecycleService } from './reservations-lifecycle.service';
import { ChatWorkerGateway } from './chat-worker.gateway';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController, ChatController],
  providers: [
    ReservationsService,
    ChatGateway,
    ChatWorkerGateway,
    ReservationsQuotationService,
    ReservationsLifecycleService,
  ],
  exports: [
    ReservationsService,
    ChatGateway,
    ReservationsQuotationService,
    ReservationsLifecycleService,
  ],
})
export class ReservationsModule {}
